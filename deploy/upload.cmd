@echo off
REM ---------------------------------------------------------------------------
REM  Copy the website to the live server and update it there.
REM  Run from the project folder (or double-click):   deploy\upload.cmd
REM
REM  Packs back-end + front-end (without .venv, node_modules, the local database,
REM  uploads and your local .env), copies the pack to the server, unpacks it in
REM  /srv/engivexlab/app and runs deploy/update.sh there.
REM  The server keeps its own .env, database and uploaded files.
REM  You will be asked for the server password twice (copy + run).
REM ---------------------------------------------------------------------------
setlocal
set SERVER=root@64.227.11.252
set ROOT=%~dp0..
set PKG=%TEMP%\engivexlab.tgz

echo [1/3] Packing the project...
tar -czf "%PKG%" -C "%ROOT%" ^
  --exclude=node_modules --exclude=.venv --exclude=dist --exclude=__pycache__ ^
  --exclude=db.sqlite3 --exclude=media --exclude=staticfiles --exclude=.env ^
  --exclude=*.log --exclude=.git ^
  back-end front-end deploy README.md
if errorlevel 1 goto :fail

echo [2/3] Copying to %SERVER% ...
scp "%PKG%" %SERVER%:/tmp/engivexlab.tgz
if errorlevel 1 goto :fail

echo [3/3] Unpacking and updating on the server...
ssh %SERVER% "mkdir -p /srv/engivexlab/app && tar -xzf /tmp/engivexlab.tgz -C /srv/engivexlab/app && sed -i 's/\r$//' /srv/engivexlab/app/deploy/*.sh && if [ -f /srv/engivexlab/app/back-end/.env ]; then bash /srv/engivexlab/app/deploy/update.sh; else echo 'First upload done. Now run: bash /srv/engivexlab/app/deploy/server-setup.sh engivexlab.com you@example.com'; fi"
if errorlevel 1 goto :fail
echo Done.
goto :eof

:fail
echo Something went wrong - see the messages above.
exit /b 1
