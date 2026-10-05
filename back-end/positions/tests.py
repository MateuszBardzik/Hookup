from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from .models import Application, Position

User = get_user_model()


def apply_form(position, **extra):
    data = {
        "position": position.pk,
        "related_experience": "5 years of KiCAD",
        "motivation": "I love testing tools",
        "availability": "10_20",
        "agreed_terms": "true",
    }
    data.update(extra)
    return data


class PositionApiTests(TestCase):
    def setUp(self):
        self.kicad = Position.objects.create(
            title="KiCAD Expert",
            outline="Test KiCAD plugins",
            highlights="Training provided\n- Remote / flexible work\n",
            why_apply="Good pay\nFlexible hours",
            category="pcb",
            sort_order=1,
        )
        Position.objects.create(title="Hidden", outline="x", is_active=False)

    def test_list_is_public_and_shows_only_active(self):
        res = APIClient().get("/api/positions/")
        self.assertEqual(res.status_code, 200)
        self.assertEqual([p["title"] for p in res.data], ["KiCAD Expert"])
        item = res.data[0]
        self.assertEqual(item["highlights"], ["Training provided", "Remote / flexible work"])  # lines -> list
        self.assertEqual(item["why_apply"], ["Good pay", "Flexible hours"])
        self.assertEqual(item["category_label"], "PCB design")
        self.assertEqual(item["employment_type_label"], "Contract")
        self.assertNotIn("test_form_url", item)  # the test link is never public
        self.assertNotIn("test_instructions", item)

    def test_detail(self):
        self.assertEqual(APIClient().get(f"/api/positions/{self.kicad.pk}/").data["title"], "KiCAD Expert")


@override_settings(MEDIA_ROOT="/tmp/engivexlab-test-media")
class ApplicationApiTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            "tina@example.com", "Str0ng-pass-123", first_name="Tina", last_name="Test", phone="+1 555", address="Toronto"
        )
        self.kicad = Position.objects.create(
            title="KiCAD Expert",
            outline="x",
            test_instructions="Step 1\nStep 2",
            test_form_url="https://docs.google.com/forms/d/e/abc/viewform?usp=pp_url&entry.1=%7Bname%7D&entry.2={email}",
        )
        self.client = APIClient()
        self.client.force_authenticate(self.user)

    def test_apply_needs_login(self):
        self.assertEqual(APIClient().post("/api/positions/applications/", apply_form(self.kicad)).status_code, 401)

    def test_apply_with_resume_then_no_duplicate(self):
        resume = SimpleUploadedFile("cv.pdf", b"%PDF-1.4 test", content_type="application/pdf")
        res = self.client.post("/api/positions/applications/", apply_form(self.kicad, resume=resume), format="multipart")
        self.assertEqual(res.status_code, 201, res.data)
        # step 1 is done by submitting: straight to the qualification test, with its Google Form link
        self.assertEqual(res.data["stage"], 2)
        self.assertEqual(res.data["stage_label"], "Qualification test")
        self.assertIn("docs.google.com/forms", res.data["test_form_link"])
        app = Application.objects.get()
        self.assertTrue(app.resume.name.startswith("resumes/"))
        # personal information copied from the account / profile
        self.assertEqual((app.full_name, app.email, app.phone, app.location), ("Tina Test", "tina@example.com", "+1 555", "Toronto"))

        again = self.client.post("/api/positions/applications/", apply_form(self.kicad), format="multipart")
        self.assertEqual(again.status_code, 400)
        self.assertIn("position", again.data)

    def test_required_fields_terms_and_resume_type(self):
        res = self.client.post(
            "/api/positions/applications/",
            apply_form(
                self.kicad, related_experience="", agreed_terms="false", resume=SimpleUploadedFile("x.exe", b"MZ")
            ),
            format="multipart",
        )
        self.assertEqual(res.status_code, 400)
        self.assertIn("related_experience", res.data)
        self.assertIn("agreed_terms", res.data)
        self.assertIn("resume", res.data)

    def test_motivation_is_optional(self):
        res = self.client.post("/api/positions/applications/", apply_form(self.kicad, motivation=""), format="multipart")
        self.assertEqual(res.status_code, 201)

    def test_applicant_cannot_set_own_stage(self):
        res = self.client.post("/api/positions/applications/", apply_form(self.kicad, stage=5), format="multipart")
        self.assertEqual(res.data["stage"], 2)

    def test_each_position_has_its_own_test_link(self):
        ai = Position.objects.create(title="AI Evaluator", outline="x", test_form_url="https://forms.gle/ai-test")
        self.client.post("/api/positions/applications/", apply_form(ai), format="multipart")
        self.client.post("/api/positions/applications/", apply_form(self.kicad), format="multipart")
        links = {a["position_title"]: a["test_form_link"] for a in self.client.get("/api/positions/applications/").data}
        self.assertEqual(links["AI Evaluator"], "https://forms.gle/ai-test")
        self.assertIn("entry.1=Tina%20Test", links["KiCAD Expert"])

    def test_test_link_hidden_before_step_2_and_when_closed(self):
        app = Application.objects.create(user=self.user, position=self.kicad)  # created by an admin: step 1
        self.assertEqual(self.client.get("/api/positions/applications/").data[0]["test_form_link"], "")
        app.stage, app.status = Application.Stage.QUALIFICATION, Application.Status.REJECTED
        app.save()
        self.assertEqual(self.client.get("/api/positions/applications/").data[0]["test_form_link"], "")

    def test_test_link_appears_at_qualification_step(self):
        self.client.post("/api/positions/applications/", apply_form(self.kicad), format="multipart")
        data = self.client.get("/api/positions/applications/").data[0]
        self.assertEqual(data["test_instructions"], "Step 1\nStep 2")
        self.assertEqual(
            data["test_form_link"],
            "https://docs.google.com/forms/d/e/abc/viewform?usp=pp_url&entry.1=Tina%20Test&entry.2=tina%40example.com",
        )

    def test_only_my_applications(self):
        other = User.objects.create_user("bob@example.com", "Str0ng-pass-123")
        Application.objects.create(user=other, position=self.kicad)
        self.assertEqual(self.client.get("/api/positions/applications/").data, [])


class PositionActiveFlagTests(TestCase):
    def test_is_active_follows_test_link_without_revealing_it(self):
        Position.objects.create(title="With test", test_form_url="https://forms.gle/abc")
        Position.objects.create(title="No test yet")
        data = {p["title"]: p for p in APIClient().get("/api/positions/").data}
        self.assertTrue(data["With test"]["is_active"])
        self.assertFalse(data["No test yet"]["is_active"])
        self.assertNotIn("test_form_url", data["With test"])
