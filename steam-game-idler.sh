#!/usr/bin/bash
set -e

# ENV VARS
[ -z "$APP_NAME" ] && APP_NAME='steam-game-idler' 
[ -z "$REPO_BRANCH" ] && REPO_BRANCH='cli-webui'
[ -z "$REPO_PATH" ] && REPO_PATH="./"
[ -z "$REPO_URL" ] && REPO_URL="https://github.com/ProbablyRaging/${APP_NAME}.git"

# Functions()
chk_cmd() {
  if hash "$1" &>/dev/null; then
    return 0
  else
    echo "Command not found: $1"
    return 1
  fi
}

chk_run() {
  if chk_cmd pgrep &>/dev/null; then
    pgrep -f "$1" &>/dev/null
  elif [[ "$OSTYPE" =~ ^cygwin|msys$ ]]; then
    chk_cmd find
    find /proc -maxdepth 1 -type d -regextype sed -regex '^.\+/[0-9]\+' -exec bash -c 'xargs -0 < {}/cmdline' \; | grep "$1" &>/dev/null
  else
    chk_cmd ps
    ps -ef | grep "$1" &>/dev/null
  fi
}

npm_inst_fix() {
  if [ "$NPM_CLEAR" = 'true' ]; then
    rm -rf package-lock.json node_modules
    echo 'Package lock and node modules cleared.'
    npm install npm@latest
  fi
  if [ "$NPM_AUDIT" = 'true' ]; then
    # Use audit fix in the name of security
    npm audit fix --force
  elif [ "$NPM_CLEAR" != 'true' ]; then
    npm install npm@latest
  fi
}

usage() {
  cat << EOF
Usage: ${0##*/} [-h|--help] [-c|--clear-npm]
                               Clear NPM package-lock.json
                               and node_modules directory
                            [-t|--tmux]
                               Execute node with tmux
                            [-f|--fix-audit]
                               Run "npm audit fix --force"
                               Otherwise use "npm install"

                Examples:
                         ${0##*/} -t -f
                         ${0##*/} --tmux --fix-audit
                         ${0##*/} --clear-npm --tmux --fix-audit
                         REPO_PATH=~/$APP_NAME ${0##*/} --clear-npm --tmux --fix-audit
EOF
  exit 0
}

# Arguments

for ARG in $@; do
  case "$ARG" in
    -h|--help)
      usage
      ;;
    -c|--clear-npm)
      NPM_CLEAR='true'
      ;;
    -f|--fix-audit)
      NPM_AUDIT='true'
      ;;
    -t|--tmux)
      chk_cmd tmux
      TMUX_CMD='tmux new-session'
      ;;
    *)
      echo "Invalid option: $1"
      usage
      exit 1
      ;;
  esac
done

# Main logic
if chk_run 'node index.js'; then
  echo 'Running process identified, aborting...'
  [ "$TMUX_CMD" = 'true' ] && echo 'To re-attach: tmux attach'
  exit 1
fi

chk_cmd rm
chk_cmd git
if [ -d "$REPO_PATH" ]; then
  cat << EOF
**************************************************************
* Updating $APP_NAME within $REPO_PATH
**************************************************************

EOF
  cd "$REPO_PATH"
  #git pull
else
  cat << EOF
**************************************************************
* Installing $APP_NAME to $REPO_PATH
**************************************************************

EOF
  git clone -b "$REPO_BRANCH" "$REPO_URL" "$REPO_PATH"
  cd "$REPO_PATH"
fi

echo
chk_cmd npm
cat << 'EOF'
**************************************************************
* Updating cli node dependencies...
**************************************************************

EOF
npm_inst_fix

echo
cd ./src
cat << 'EOF'
**************************************************************
* Updating webui node dependencies...
**************************************************************

EOF
npm_inst_fix
cd ../

if [ "$NPM_AUDIT" = 'true' ]; then
  cat << 'EOF'

**************************************************************
*                                                            *
*    Used "audit fix". If you encounter problems, please     *
*    consider reporting to the appropiate upstream project.  *
*                                                            *
**************************************************************
EOF
  sleep 3
fi


chk_cmd node
if [ -n "$TMUX_CMD" ]; then
  $TMUX_CMD node index.js
else
  node index.js
fi
