let commands = {
    login: {
        help: function(args) {
            return '<br><strong>NAME</strong><br>' +
                '&nbsp;&nbsp;&nbsp;&nbsp;login<br><br>' +
                '<strong>SYNOPSIS</strong><br>' +
                '&nbsp;&nbsp;&nbsp;&nbsp;login [USER]<br><br>' +
                '<strong>DESCRIPTION</strong><br>' +
                '&nbsp;&nbsp;&nbsp;&nbsp;Login using the given username.<br><br>';
        },

        callback: function(args) {
            this.user = this.utils.arrayOfObjectsHasKeyValue(lightdm.users, 'name', args[0]);

            if (!this.user) {
                this.stderr(`bash: no such user: ${args[0]}`);
                return false;
            }

            if (lightdm.in_authentication) {
                lightdm.cancel_authentication();
            }

            this.session = this.user.session !== null && this.user.session === this.session ? this.user.session : this.session;

            lightdm.start_authentication(this.user.name);
            return true;
        },

        password: function(password, response) {
            if (lightdm.in_authentication) {
                setTimeout(function() {
                    lightdm.respond(password);
                }, 200);

                return null;
            }

            return `call login [user]<br>`;
        }
    },
    passwd: {
        help: function(args) {
            return '<br><strong>NAME</strong><br>' +
                '&nbsp;&nbsp;&nbsp;&nbsp;passwd<br><br>' +
                '<strong>SYNOPSIS</strong><br>' +
                '&nbsp;&nbsp;&nbsp;&nbsp;passwd<br><br>' +
                '<strong>DESCRIPTION</strong><br>' +
                '&nbsp;&nbsp;&nbsp;&nbsp;Login to an existing session.<br><br>';
        },

        callback: function(args) {
            this.user = this.utils.arrayOfObjectsHasKeyValue(lightdm.users, 'name', this.username);

            if (!this.user) {
                this.stderr(`bash: no sessions exist`);
                return false;
            }

            if (lightdm.in_authentication) {
                lightdm.cancel_authentication();
            }

            this.session = this.user.session !== null ? this.user.session : this.session;
            lightdm.start_authentication(this.user.name);
            return true;
        },

        password: function(password, response) {
            if (lightdm.in_authentication) {
                setTimeout(function() {
                    lightdm.respond(password);
                }, 200);

                return null;
            }

            return `call login [user]<br>`;
        }
    },
    users: {
        help: function(args) {
            return '<br><strong>NAME</strong><br>' +
                '&nbsp;&nbsp;&nbsp;&nbsp;users<br><br>' +
                '<strong>SYNOPSIS</strong><br>' +
                '&nbsp;&nbsp;&nbsp;&nbsp;users<br><br>' +
                '<strong>DESCRIPTION</strong><br>' +
                '&nbsp;&nbsp;&nbsp;&nbsp;List out all available users.<br><br>';
        },

        callback: function(args) {
            let users = '';

            lightdm.users.forEach(function(user) {
                users += '<span class="stdout-off-white">' + user.name + "</span><br>";
            });

            return users;
        }
    },
    ls: {
        help: function(args) {
            return '<br><strong>NAME</strong><br>' +
                '&nbsp;&nbsp;&nbsp;&nbsp;ls<br><br>' +
                '<strong>SYNOPSIS</strong><br>' +
                '&nbsp;&nbsp;&nbsp;&nbsp;ls<br><br>' +
                '<strong>DESCRIPTION</strong><br>' +
                '&nbsp;&nbsp;&nbsp;&nbsp;List out all available sessions.<br><br>';
        },

        callback: function(args) {
            sessions = '';

            lightdm.sessions.forEach(function(session) {
                sessions += '<span class="stdout-off-white">' + session.key + "</span><br>";
            });

            return sessions;
        }
    },
    session: {
        help: function(args) {
            return '<br><strong>NAME</strong><br>' +
                '&nbsp;&nbsp;&nbsp;&nbsp;session<br><br>' +
                '<strong>SYNOPSIS</strong><br>' +
                '&nbsp;&nbsp;&nbsp;&nbsp;session [NAME]<br><br>' +
                '<strong>DESCRIPTION</strong><br>' +
                '&nbsp;&nbsp;&nbsp;&nbsp;Set the session to login to.<br><br>';
        },

        callback: function(args) {
            // TODO: Verify session
            let session = args[0];
            session = this.utils.arrayOfObjectsHasKeyValue(lightdm.sessions, 'key', session);

            if (!session) {
                this.stderr(`bash: no such session: ${session}`);
                return false;
            }

            this.session = session.key;
            this.cache_set(this.session, 'last_session');
            return true;
        }
    },
    poweroff: {
        help: function(args) {
            return '<br><strong>NAME</strong><br>' +
                '&nbsp;&nbsp;&nbsp;&nbsp;poweroff<br><br>' +
                '<strong>SYNOPSIS</strong><br>' +
                '&nbsp;&nbsp;&nbsp;&nbsp;poweroff<br><br>' +
                '<strong>DESCRIPTION</strong><br>' +
                '&nbsp;&nbsp;&nbsp;&nbsp;May be used to power off the machine.<br><br>';
        },

        callback: function(args) {
            lightdm.shutdown();
            return true;
        }
    },
    reboot: {
        help: function(args) {
            return '<br><strong>NAME</strong><br>' +
                '&nbsp;&nbsp;&nbsp;&nbsp;reboot<br><br>' +
                '<strong>SYNOPSIS</strong><br>' +
                '&nbsp;&nbsp;&nbsp;&nbsp;reboot<br><br>' +
                '<strong>DESCRIPTION</strong><br>' +
                '&nbsp;&nbsp;&nbsp;&nbsp;May be used to restart the machine.<br><br>';
        },

        callback: function(args) {
            lightdm.restart();
            return true;
        }
    },
    suspend: {
        help: function(args) {
            return '<br><strong>NAME</strong><br>' +
                '&nbsp;&nbsp;&nbsp;&nbsp;suspend<br><br>' +
                '<strong>SYNOPSIS</strong><br>' +
                '&nbsp;&nbsp;&nbsp;&nbsp;suspend<br><br>' +
                '<strong>DESCRIPTION</strong><br>' +
                '&nbsp;&nbsp;&nbsp;&nbsp;May be used to suspend the machine.<br><br>';
        },

        callback: function(args) {
            lightdm.suspend();
            return true;
        }
    },
    clear: {
        help: function(args) {
            return '<br><strong>NAME</strong><br>' +
                '&nbsp;&nbsp;&nbsp;&nbsp;clear<br><br>' +
                '<strong>SYNOPSIS</strong><br>' +
                '&nbsp;&nbsp;&nbsp;&nbsp;clear<br><br>' +
                '<strong>DESCRIPTION</strong><br>' +
                '&nbsp;&nbsp;&nbsp;&nbsp;Clear the terminal screen.<br><br>';
        },

        callback: function(args) {
            this.output.innerHTML = '';
            return true;
        }
    },
    help: {
        callback: function(args) {
            let keys = this.commands.keys();
            let stdout = '';

            for (var i in keys) {
                stdout += `${keys[i]}&emsp;&emsp;&emsp;`;
            };

            return stdout + "<br>";
        }
    },
    man: {
        help: function(args) {
            return '<br><strong>NAME</strong><br>' +
                '&nbsp;&nbsp;&nbsp;&nbsp;man<br><br>' +
                '<strong>SYNOPSIS</strong><br>' +
                '&nbsp;&nbsp;&nbsp;&nbsp;man [COMMAND]<br><br>' +
                '<strong>DESCRIPTION</strong><br>' +
                '&nbsp;&nbsp;&nbsp;&nbsp;A refence manual to give information about a specific command.<br><br>';
        },

        callback: function(args) {
            let keys = this.commands.keys();
            let stdin = args[0];
            let stdout = '';
            let stderr = `<span class="stdout-red">No manual entry for ${stdin}<br>`;

            if (this.utils.isEmpty(stdin)) {
                return '<span class="stdout-red">What manual page do you want?</span><br>';
            }

            // If command not in keys


            if (this.commands.exists(stdin)) {
                let command = this.commands.get(stdin);

                if (this.utils.hasProperty(command, 'help')) {
                    stdout += command['help']();
                }
                else {
                    console.log("man");
                    return stderr;
                }
            }
            else {
                return stderr;
            }

            return stdout;
        }
    },
    motd: {
        help: function(args) {
            return '<br><strong>NAME</strong><br>' +
                '&nbsp;&nbsp;&nbsp;&nbsp;motd<br><br>' +
                '<strong>SYNOPSIS</strong><br>' +
                '&nbsp;&nbsp;&nbsp;&nbsp;motd<br><br>' +
                '<strong>DESCRIPTION</strong><br>' +
                '&nbsp;&nbsp;&nbsp;&nbsp;Display the current motd<br><br>';
        },

        callback: function(args) {
            return "" +
                "  .oooooo.   ooo        ooooo ooooo     ooo    ooooooooooooo ooo        ooooo ooooooooooooo<br>".replace(/\s/g, '&nbsp;') +
                " d8P'  `Y8b  `88.       .888' `888'     `8'    8'   888   `8 `88.       .888' 8'   888   `8<br>".replace(/\s/g, '&nbsp;') +
                "888           888b     d'888   888       8          888       888b     d'888       888     <br>".replace(/\s/g, '&nbsp;') +
                "888           8 Y88. .P  888   888       8          888       8 Y88. .P  888       888     <br>".replace(/\s/g, '&nbsp;') +
                "888           8  `888'   888   888       8          888       8  `888'   888       888     <br>".replace(/\s/g, '&nbsp;') +
                "`88b    ooo   8    Y     888   `88.    .8'          888       8    Y     888       888     <br>".replace(/\s/g, '&nbsp;') +
                " `Y8bood8P'  o8o        o888o    `YbodP'           o888o     o8o        o888o     o888o    <br><br>".replace(/\s/g, '&nbsp;');
        }
    }
}