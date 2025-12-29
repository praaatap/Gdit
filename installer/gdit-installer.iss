; Inno Setup Script for gdit
; Git-like version control for Google Drive

#define MyAppName "gdit"
#define MyAppVersion "3.0.3"
#define MyAppPublisher "gdit"
#define MyAppURL "https://github.com/praaatap/gdit"
#define MyAppExeName "gdit.exe"

[Setup]
; NOTE: The value of AppId uniquely identifies this application.
AppId={{8F9E4C2A-5B3D-4E7F-9A1C-6D8E2F3B4A5C}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}/releases
DefaultDirName={autopf}\{#MyAppName}
DefaultGroupName={#MyAppName}
AllowNoIcons=yes
; Output settings
OutputDir=..\release
OutputBaseFilename=gdit-{#MyAppVersion}-windows-x64-setup
; Compression
Compression=lzma2/ultra64
SolidCompression=yes
; Windows compatibility
MinVersion=10.0
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible
; Installer appearance
WizardStyle=modern
SetupIconFile=..\assets\icon.ico
UninstallDisplayIcon={app}\{#MyAppExeName}
; Privileges
PrivilegesRequired=admin
PrivilegesRequiredOverridesAllowed=dialog

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "addtopath"; Description: "Add gdit to system PATH (recommended)"; GroupDescription: "Additional options:"; Flags: checkedonce

[Files]
; Main executable
Source: "..\gdit.exe"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
; Start menu shortcuts
Name: "{group}\gdit Command Prompt"; Filename: "{cmd}"; Parameters: "/k ""{app}\{#MyAppExeName}"""; WorkingDir: "{userdocs}"
Name: "{group}\Uninstall gdit"; Filename: "{uninstallexe}"

[Registry]
; Add to PATH if selected
Root: HKLM; Subkey: "SYSTEM\CurrentControlSet\Control\Session Manager\Environment"; ValueType: expandsz; ValueName: "Path"; ValueData: "{olddata};{app}"; Tasks: addtopath; Check: NeedsAddPath(ExpandConstant('{app}'))

[Run]
; Show completion message
Filename: "{cmd}"; Parameters: "/c ""{app}\{#MyAppExeName}"" --version & pause"; Description: "Verify gdit installation"; Flags: postinstall shellexec skipifsilent

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
  Result := Pos(';' + Param + ';', ';' + OrigPath + ';') = 0;
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
      P := Pos(';' + AppPath, Path);
      if P > 0 then
      begin
        Delete(Path, P, Length(';' + AppPath));
        RegWriteStringValue(HKLM, 'SYSTEM\CurrentControlSet\Control\Session Manager\Environment', 'Path', Path);
      end;
    end;
  end;
end;
