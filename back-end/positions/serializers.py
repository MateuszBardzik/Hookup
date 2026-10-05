from rest_framework import serializers

from .models import Application, Position, lines
from .prefill import personalize_form_url


class PositionSerializer(serializers.ModelSerializer):
    """Everything the Careers page and the details popup show. Public (no login needed).
    The qualification test link is NOT here: it is only sent with an application (see below).
    `is_active` only says whether a test link is set (= the position is active), not what it is."""

    category_label = serializers.CharField(source="get_category_display", read_only=True)
    employment_type_label = serializers.CharField(source="get_employment_type_display", read_only=True)
    # Multi-line fields sent as lists, ready for bullet lists
    highlights = serializers.SerializerMethodField()
    responsibilities = serializers.SerializerMethodField()
    requirements = serializers.SerializerMethodField()
    why_apply = serializers.SerializerMethodField()
    is_active = serializers.SerializerMethodField()

    class Meta:
        model = Position
        fields = [
            "id",
            "title",
            "outline",
            "highlights",
            "description",
            "responsibilities",
            "requirements",
            "why_apply",
            "plugin_description",
            "image",
            "instruction_guideline",
            "category",
            "category_label",
            "employment_type",
            "employment_type_label",
            "location",
            "countries",
            "pay",
            "is_active",
        ]

    def get_is_active(self, obj):
        """Active = the admin has set the qualification test (Google Form) link."""
        return bool(obj.test_form_url)

    def get_highlights(self, obj):
        return lines(obj.highlights)

    def get_responsibilities(self, obj):
        return lines(obj.responsibilities)

    def get_requirements(self, obj):
        return lines(obj.requirements)

    def get_why_apply(self, obj):
        return lines(obj.why_apply)


class ApplicationSerializer(serializers.ModelSerializer):
    """
    The Apply form (POST, multipart because of the resume) and the applicant's own
    applications (GET). Hiring-process fields are read-only: admins change them.
    """

    position_title = serializers.CharField(source="position.title", read_only=True)
    stage_label = serializers.CharField(source="get_stage_display", read_only=True)
    status_label = serializers.CharField(source="get_status_display", read_only=True)
    # Qualification test: only filled in once the application reached that step
    test_instructions = serializers.SerializerMethodField()
    test_form_link = serializers.SerializerMethodField()

    class Meta:
        model = Application
        fields = [
            "id",
            "position",
            "position_title",
            "full_name",
            "email",
            "phone",
            "location",
            "related_experience",
            "resume",
            "motivation",
            "availability",
            "agreed_terms",
            "stage",
            "stage_label",
            "status",
            "status_label",
            "id_verified",
            "admin_note",
            "test_instructions",
            "test_form_link",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["stage", "status", "id_verified", "admin_note", "created_at", "updated_at"]
        # Name, email, phone and location are not on the Apply form: they are copied from the
        # applicant's account / profile when the application is created (see create()).
        read_only_fields = read_only_fields + ["full_name", "email", "phone", "location"]
        extra_kwargs = {
            "related_experience": {"required": True, "allow_blank": False},  # "Why do you want to join us?" is optional
            "availability": {"required": True, "allow_blank": False},
            "resume": {"write_only": False},
        }

    RESUME_TYPES = (".pdf", ".doc", ".docx")
    RESUME_MAX_MB = 5

    def _test_open(self, obj):
        return obj.stage >= Application.Stage.QUALIFICATION and obj.status == Application.Status.IN_PROGRESS

    def get_test_instructions(self, obj):
        return obj.position.test_instructions if self._test_open(obj) else ""

    def get_test_form_link(self, obj):
        if not self._test_open(obj):
            return ""
        return personalize_form_url(obj.position.test_form_url, obj.user)

    def validate_position(self, position):
        if not position.is_active:
            raise serializers.ValidationError("This position is closed.")
        user = self.context["request"].user
        if Application.objects.filter(user=user, position=position).exists():
            raise serializers.ValidationError("You already applied to this position.")
        return position

    def validate_agreed_terms(self, value):
        if not value:
            raise serializers.ValidationError("Please accept the terms to apply.")
        return value

    def validate_resume(self, file):
        if file:
            if not file.name.lower().endswith(self.RESUME_TYPES):
                raise serializers.ValidationError("Upload a PDF, DOC or DOCX file.")
            if file.size > self.RESUME_MAX_MB * 1024 * 1024:
                raise serializers.ValidationError(f"The file is larger than {self.RESUME_MAX_MB} MB.")
        return file

    def create(self, validated_data):
        # Submitting the form completes step 1 (Apply): the application goes straight to
        # step 2, so the position's qualification test (Google Form) is open right away.
        user = self.context["request"].user
        return Application.objects.create(
            user=user,
            stage=Application.Stage.QUALIFICATION,
            # personal information comes from the account / profile page
            full_name=f"{user.first_name} {user.last_name}".strip(),
            email=user.email,
            phone=user.phone,
            location=user.address,
            **validated_data,
        )
