{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs";
    utils.url = "github:numtide/flake-utils";
    stack-theme = {
      url = "github:CaiJimmy/hugo-theme-stack";
      flake = false;
    };
  };

  outputs = { self, nixpkgs, utils, stack-theme, ... }:
    utils.lib.eachDefaultSystem
      (system:
        let
          pkgs = import nixpkgs {
            inherit system;
          };
        in {
          packages = {
            hugo-blog = pkgs.stdenv.mkDerivation rec {
              name = "hugo-blog";
              src = self;
              configurePhase = ''
                mkdir -p "themes/stack"
                cp -r ${stack-theme}/* "themes/stack"
              '';
              buildPhase = ''
                ${pkgs.hugo}/bin/hugo --minify
              '';
              installPhase = "cp -r public $out";
            };

            default = self.packages.${system}.hugo-blog;
          };

          apps = rec {
            build = utils.lib.mkApp { drv = pkgs.hugo; };
            serve = utils.lib.mkApp {
              drv = pkgs.writeShellScriptBin "hugo-serve" ''
                ${pkgs.hugo}/bin/hugo server -D
              '';
            };
            newpost = utils.lib.mkApp {
              drv = pkgs.writeShellScriptBin "new-post" ''
                ${pkgs.hugo}/bin/hugo new content posts/"$1".md
              '';
            };

            default = serve;
          };

          devShells.default = pkgs.mkShell {
            buildInputs = [ pkgs.hugo ];
            shellHook = ''
              mkdir -p themes
              ln -sn "${stack-theme}" "themes/stack"
            '';
          };
        }
      );
}

