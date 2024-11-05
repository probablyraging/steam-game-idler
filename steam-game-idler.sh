#!/usr/bin/bash
set -e

# ENV VARS
SCRIPT_NAME="${0##*/}"
for (( i = 0; i <= ${#SCRIPT_NAME}; i++ )); do
  SCRIPT_SPACE="${SCRIPT_SPACE} "
done

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
    if [ "$NPM_AUDIT_FORCE" = 'true' ]; then
      npm audit fix --force
    else
      # Permit unfixed modules
      set +e
      npm audit fix
      set -e
    fi
  elif [ "$NPM_CLEAR" != 'true' ]; then
    npm install npm@latest
  fi
}

usage() {
  cat << EOF
Usage: $SCRIPT_NAME [-h|--help] [-a|--audit-fix]
$SCRIPT_SPACE                     Run "npm audit fix"
$SCRIPT_SPACE                     Otherwise use "npm install"
$SCRIPT_SPACE                   [-c|--clear-npm]
$SCRIPT_SPACE                     Clear NPM package-lock.json
$SCRIPT_SPACE                     and node_modules directory
$SCRIPT_SPACE                   [-f|--force-fix]
$SCRIPT_SPACE                     This enables --audit-fix
$SCRIPT_SPACE                     Run "npm audit fix --force"
$SCRIPT_SPACE                   [-t|--tmux]
$SCRIPT_SPACE                     Execute node with tmux
$SCRIPT_SPACE
$SCRIPT_SPACE       Examples:
$SCRIPT_SPACE                $SCRIPT_NAME -t -f
$SCRIPT_SPACE                $SCRIPT_NAME --tmux --audit-fix
$SCRIPT_SPACE                         $SCRIPT_NAME --clear-npm --tmux --audit-fixx
$SCRIPT_SPACE                         REPO_PATH=~/$APP_NAME $SCRIPT_NAME --clear-npm --tmux --force-fix
EOF
  exit 0
}

# Arguments

for ARG in $@; do
  case "$ARG" in
    -a|--audit-fix)
      NPM_AUDIT='true'
      ;;
    -c|--clear-npm)
      NPM_CLEAR='true'
      ;;
    -f|--force-fix)
      NPM_AUDIT='true'
      NPM_AUDIT_FORCE='true'
      ;;
    -h|--help)
      usage
      ;;
    -t|--tmux)
      chk_cmd tmux
      TMUX_CMD='tmux new-session'
      ;;
    *)
      echo "Invalid option: $ARG"
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
if [[ -d "$REPO_PATH" && -d "${REPO_PATH}/.git" ]]; then
  cat << EOF
**************************************************************
* Updating $APP_NAME within $REPO_PATH
**************************************************************

EOF
  cd "$REPO_PATH"
  git pull
else
  cat << EOF
**************************************************************
* Installing $APP_NAME to $REPO_PATH
**************************************************************

EOF
  if [ -d "$REPO_PATH/.git" ]; then
    git clone -b "$REPO_BRANCH" "$REPO_URL" "$REPO_PATH"
  else
    git clone -b "$REPO_BRANCH" "$REPO_URL" .tmp
    mv .tmp/.git .
    rm -rf .tmp
  fi
  git checkout cli-webui -f
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

if [ -d "./src" ]; then
  echo
  cd ./src
  cat << 'EOF'
**************************************************************
* Updating webui node dependencies...
**************************************************************

EOF
  npm_inst_fix
  cd ../
else
  cat << EOF

**************************************************************
* Uneable to update webui node dependencies...
* Path doesn't yet exist, it's strongly recommended
* to exit, clear $REPO_PATH and re-run
* the script with --clear-npm
**************************************************************
EOF
  exit 1
fi

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
