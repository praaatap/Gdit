# typed: false
# frozen_string_literal: true

class Gdit < Formula
  desc "Git-like version control for Google Drive"
  homepage "https://github.com/praaatap/Gdit"
  license "MIT"

  # For npm-based installation (cross-platform)
  depends_on "node"

  def install
    system "npm", "install", "-g", "gdit@#{version}"
    
    # Create wrapper script
    (bin/"gdit").write <<~EOS
      #!/bin/bash
      exec "$(npm root -g)/gdit/dist/index.js" "$@"
    EOS
  end

  def caveats
    <<~EOS
      gdit has been installed!

      Quick Start:
        1. gdit setup-creds  - Configure Google API credentials
        2. gdit login        - Authenticate with Google
        3. gdit init         - Initialize a repository

      Run 'gdit --help' for more commands.
    EOS
  end

  test do
    assert_match version.to_s, shell_output("#{bin}/gdit --version")
  end
end
