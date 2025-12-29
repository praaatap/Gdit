; Inno Setup Script for gdit
; Git-like version control for Google Drive
; Professional Windows Installer

#define MyAppName "gdit"
#define MyAppVersion "3.0.3"
#define MyAppPublisher "Pratap"
#define MyAppURL "https://github.com/praaatap/Gdit"
#define MyAppExeName "gdit.exe"
#define MyAppDescription "Git-like version control for Google Drive"

[Setup]
; Application identity
AppId={{8F9E4C2A-5B3D-4E7F-9A1C-6D8E2F3B4A5C}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppVerName={#MyAppName} {#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}/issues
AppUpdatesURL={#MyAppURL}/releases
AppContact=pratap@example.com
AppComments={#MyAppDescription}
AppCopyright=Copyright (C) 2024 {#MyAppPublisher}

; Version info (shows in file properties)
VersionInfoVersion={#MyAppVersion}
VersionInfoCompany={#MyAppPublisher}
VersionInfoDescription={#MyAppDescription}
VersionInfoTextVersion={#MyAppVersion}
VersionInfoCopyright=Copyright (C) 2024 {#MyAppPublisher}
VersionInfoProductName={#MyAppName}
VersionInfoProductVersion={#MyAppVersion}

; Install locations
DefaultDirName={autopf}\{#MyAppName}
DefaultGroupName={#MyAppName}
AllowNoIcons=yes
DisableProgramGroupPage=yes

; Output settings
OutputDir=..\release
OutputBaseFilename=gdit-{#MyAppVersion}-windows-x64-setup
SetupIconFile=..\assets\icon.ico
UninstallDisplayIcon={app}\{#MyAppExeName}
UninstallDisplayName={#MyAppName}

; Compression (maximum)
Compression=lzma2/ultra64
SolidCompression=yes
LZMAUseSeparateProcess=yes

; Windows compatibility
MinVersion=10.0
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible

; Installer appearance
WizardStyle=modern
WizardSizePercent=120
DisableWelcomePage=no
ShowLanguageDialog=auto

; Privileges - allow user to choose
PrivilegesRequired=admin
PrivilegesRequiredOverridesAllowed=dialog commandline

; Add/Remove Programs info
UninstallFilesDir={app}\uninstall

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Messages]
WelcomeLabel1=Welcome to {#MyAppName} Setup
WelcomeLabel2=This will install {#MyAppName} {#MyAppVersion} on your computer.%n%n{#MyAppDescription}%n%nClick Next to continue.

[Tasks]
Name: "addtopath"; Description: "Add gdit to system PATH (recommended)"; GroupDescription: "System Integration:"; Flags: checkedonce
Name: "desktopicon"; Description: "Create a Desktop shortcut"; GroupDescription: "Additional Icons:"; Flags: unchecked

[Files]
; Main executable
Source: "..\gdit.exe"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
; Start menu - Command Prompt shortcut
Name: "{group}\gdit Command Prompt"; Filename: "{cmd}"; Parameters: "/k cd /d ""{userdocs}"" && echo gdit is ready! Type 'gdit --help' to get started."; WorkingDir: "{userdocs}"; Comment: "Open command prompt with gdit"
Name: "{group}\gdit Documentation"; Filename: "{#MyAppURL}#readme"; Comment: "View gdit documentation online"
Name: "{group}\Uninstall {#MyAppName}"; Filename: "{uninstallexe}"; Comment: "Uninstall gdit"

; Desktop shortcut (optional)
Name: "{autodesktop}\gdit Terminal"; Filename: "{cmd}"; Parameters: "/k cd /d ""{userdocs}"" && gdit"; Tasks: desktopicon; Comment: "Open gdit terminal"

[Registry]
; Add to PATH if selected
Root: HKLM; Subkey: "SYSTEM\CurrentControlSet\Control\Session Manager\Environment"; ValueType: expandsz; ValueName: "Path"; ValueData: "{olddata};{app}"; Tasks: addtopath; Check: NeedsAddPath(ExpandConstant('{app}'))

; Add App Paths for easier execution
Root: HKLM; Subkey: "SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\gdit.exe"; ValueType: string; ValueName: ""; ValueData: "{app}\{#MyAppExeName}"
Root: HKLM; Subkey: "SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\gdit.exe"; ValueType: string; ValueName: "Path"; ValueData: "{app}"

; Register in Windows Apps
Root: HKLM; Subkey: "SOFTWARE\{#MyAppPublisher}\{#MyAppName}"; ValueType: string; ValueName: "InstallPath"; ValueData: "{app}"
Root: HKLM; Subkey: "SOFTWARE\{#MyAppPublisher}\{#MyAppName}"; ValueType: string; ValueName: "Version"; ValueData: "{#MyAppVersion}"

[Run]
; Post-install verification
Filename: "{cmd}"; Parameters: "/c ""{app}\{#MyAppExeName}"" --version && echo. && echo ✓ gdit installed successfully! && echo. && echo Quick Start: && echo   gdit setup-creds  - Configure credentials && echo   gdit login        - Login to Google && echo   gdit init         - Initialize repository && echo. && pause"; Description: "Verify installation and show quick start"; Flags: postinstall shellexec skipifsilent

; Open documentation (optional)
Filename: "{#MyAppURL}#-quick-start"; Description: "Open Quick Start Guide"; Flags: postinstall shellexec skipifsilent unchecked nowait

[UninstallRun]
; Clean notification
Filename: "{cmd}"; Parameters: "/c echo gdit has been uninstalled. && timeout /t 2"; Flags: runhidden

[UninstallDelete]
; Clean up any generated files
Type: filesandordirs; Name: "{app}"

[Code]
// Check if path needs to be added
function NeedsAddPath(Param: string): boolean;
var
  OrigPath: string;
begin
  if not RegQueryStringValue(HKLM, 'SYSTEM\CurrentControlSet\Control\Session Manager\Environment', 'Path', OrigPath) then
  begin
    Result := True;
    exit;
  end;
  // Check if already in path (case-insensitive)
  Result := Pos(';' + Lowercase(Param) + ';', ';' + Lowercase(OrigPath) + ';') = 0;
end;

// Broadcast environment change after install
procedure CurStepChanged(CurStep: TSetupStep);
var
  ResultCode: Integer;
begin
  if CurStep = ssPostInstall then
  begin
    // Notify Windows of environment change
    Exec('cmd.exe', '/c setx GDIT_INSTALLED 1 >nul 2>&1', '', SW_HIDE, ewWaitUntilTerminated, ResultCode);
  end;
end;

// Remove from PATH on uninstall
procedure CurUninstallStepChanged(CurUninstallStep: TUninstallStep);
var
  Path: string;
  AppPath: string;
  P: Integer;
begin
  if CurUninstallStep = usPostUninstall then
  begin
    if RegQueryStringValue(HKLM, 'SYSTEM\CurrentControlSet\Control\Session Manager\Environment', 'Path', Path) then
    begin
      AppPath := ExpandConstant('{app}');
      P := Pos(';' + Lowercase(AppPath), Lowercase(Path));
      if P > 0 then
      begin
        Delete(Path, P, Length(';' + AppPath));
        RegWriteStringValue(HKLM, 'SYSTEM\CurrentControlSet\Control\Session Manager\Environment', 'Path', Path);
      end;
    end;
    // Clean up registry
    RegDeleteKeyIncludingSubkeys(HKLM, 'SOFTWARE\Pratap\gdit');
    RegDeleteKeyIncludingSubkeys(HKLM, 'SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\gdit.exe');
  end;
end;

// Custom welcome page text
function InitializeSetup(): Boolean;
begin
  Result := True;
end;
