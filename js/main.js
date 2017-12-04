class tty {
    constructor(commands, debug = false) {
        // Set up history
        this.history = [];
        this.history_index = 0;
        this.previous = null;
	this.session = null;
	this.cache = '';
	this.setup_cache();

        // Set up input handlers and focus
        this.input = document.getElementById('stdin');
        this.input.addEventListener('keypress', this._keypress.bind(this));
        this.input.addEventListener('keydown', this._keydown.bind(this));
        this.input.addEventListener('keyup', this._keyup.bind(this));
        this.input.focus();

        // Misc stuff
        this.debug = false;
        this.utils = new utils();

        // Check logged in user
        this.user = this.utils.arrayOfObjectsHasKeyValue(lightdm.users, 'logged_in', true);
	if (!this.user) {
		this.user = this.cache_get('last_user');
		this.username = this.user.name ? this.user.name : this.cache_get('last_username');
	}

        // Set up output handlers
        this.output = document.getElementById('stdout');
        this.default_prompt = this.user ? `<span class="stdout-green">${this.username}</span><span class="stdout-red">@</span>${lightdm.hostname} $\xa0` : lightdm.hostname + " $\xa0"

        // Setup prompt
        this.prompt = document.getElementById('prompt');
        this.prompt.innerHTML = this.default_prompt;


        // Make sure we always focus the input
        window.addEventListener('click', function (e) {
            this.input.focus();
        }.bind(this));

        window.authentication_complete = this._authentication_complete.bind(this);

        if (this.utils.isEmpty(commands) || typeof commands != 'object') {
            this.utils.except("Commands must be an object and must not be empty!");
        }

        // Init command handler
        this.commands = new commandHandler(commands, this.utils);
        
        if (this.commands.exists('motd')) {
            this.stdout(this.commands.get('motd').callback());
        }
    }

	setup_cache() {
		// Do we have access to localStorage?
		try {
			localStorage.setItem('testing', 'test');
			let test = localStorage.getItem('testing');

			if ('test' === test) {
				// We have access to localStorage
				this.cache = 'localStorage';
			}
			localStorage.removeItem('testing');

		} catch(err) {
			// We do not have access to localStorage. Fallback to cookies.
			this.cache = 'Cookies';
		}

		// Just in case...
		if ('' === this.cache) {
			this.cache = 'Cookies';
		}
	}

	cache_get() {
		var key = `ant`, value;

		for (var _len = arguments.length, key_parts = new Array(_len), _key = 0; _key < _len; _key++) {
			key_parts[_key] = arguments[_key];
		}

		for ( var part of key_parts ) {
			key += `:${part}`;
		}

		if ('localStorage' === this.cache) {
			value = localStorage.getItem(key);
		} else if ('Cookies' === this.cache) {
			value = Cookies.get(key);
		} else {
			value = null;
		}

		return ('undefined' !== typeof(value)) ? value : null;
	}

	cache_set( value ) {
		var key = `ant`, res;

		for (var _len2 = arguments.length, key_parts = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
			key_parts[_key2 - 1] = arguments[_key2];
		}

		for ( var part of key_parts ) {
			key += `:${part}`;
		}

		if ('localStorage' === this.cache) {
			res = localStorage.setItem( key, value );
		} else if ('Cookies' === this.cache) {
			res = Cookies.set(key, value);
		} else {
			res = null;
		}

		return res;
	}

    call(command) {
        // Add to history
        this.history.unshift(command);
        this.stdout(`<span class="stdout-white">${this.prompt.innerHTML}</span> ${command}<br>`);

        // Separate command from args
        let args = command.split(' ');
        command = args.shift();

        // Check command exists, otherwise bottom out
        if (!this.commands.exists(command)) {
            this.stderr(`bash: command not found: ${command}`);
            return false;
        }

        // Call the command
        let cmd = this.commands.get(command);
        let callback = cmd.callback.bind(this);
        let response = callback(args);

        // Check for errors
        if (response === false) {
            return response;
        }

        // return if we don't require password
        if (this.utils.hasProperty(cmd, 'password') && this.utils.isFunction(cmd.password)) {
            this.previous = {
                command: command,
                response: response
            }

            // this.stdout("password:<br>");
            this.prompt.innerHTML = '<span class="stdout-green">password:</span>';
            this.input.type = 'password';
        }

        if (response !== true) {
            this.stdout(response);
        }

        return true;
    }

    password(password) {
        let cmd = this.commands.get(this.previous.command);

        let callback = cmd.password.bind(this);
        let password_response = callback(password, this.previous.response);

        this.input.type = 'text';
        this.previous = null;
        this.prompt.innerHTML = this.default_prompt;

        if (password_response == false) {
            this.stderr("incorrect password");
            return false;
        }

        return true;
    }

    stdin() {
        return this.input.value;
    }

    stdout(msg) {
        this.output.innerHTML += msg;
    }

    stderr(msg) {
        this.output.innerHTML += `<span class="stdout-red">${msg}</span><br>`;
    }

    clear() {
        this.input.value = '';
        this.history_index = 0;
    }

    autocomplete(input) {
        let keys = this.commands.keys();
        let suggestions = [];

        keys.forEach(function (key) {
            if (key.substr(0, input.length) == input) {
                suggestions.push(key);
            }
        });

        return suggestions;
    }

    set_history() {
        this.input.value = this.history_index == 0 ? '' : this.history[this.history_index - 1];
        this.input.focus();
    }

    _keypress(e) {
        if (e.which == 13) { // Enter
            let stdin = this.stdin();
            (this.input.type == 'password') ? this.password(stdin): this.call(stdin);
            this.clear();

            let wrapper = document.getElementById('terminal');
            wrapper.scrollTop = wrapper.scrollHeight;
            
            e.preventDefault();
        }
    }

    _keydown(e) {
        if (e.which == 9) { // Tab
            // TODO: Autocomplete
            let suggestions = this.autocomplete(this.stdin());

            if (!this.utils.isEmpty(suggestions)) {
                this.input.value = suggestions[0];
            }

            e.preventDefault();
        }

        if (e.ctrlKey && e.keyCode == 67) {
            this.input.value = '';
            this.history_index = 0;
            this.input.type = 'text';
            this.previous = null;
            e.preventDefault();
        }
    }

    _keyup(e) {
        if (e.keyCode == 38) { // Key up
            if (this.history_index < this.history.length) {
                this.history_index++;
                this.set_history();
            }

            e.preventDefault();
        } else if (e.keyCode == 40) { // Key down
            if (this.history_index >= 1) {
                this.history_index--;
                this.set_history();
            }

            e.preventDefault();
        }
    }

    _authentication_complete() {
	    if (this.session === null) {
	        this.session = this.cache_get('last_session');
	        if (this.session === null) {
	            this.session = lightdm.sessions[0].key;
		        this.cache_set(this.session, 'last_session');
		        this.user.session = this.session;
           }
        }
        if (lightdm.is_authenticated) {
	        this.cache_set(this.user, 'last_user');
		this.cache_set(this.user.name, 'last_username');
            //$('body').fadeOut( 1000, () => lightdm.start_session(this.session));
            $('body').fadeOut( 1000, () => lightdm.login( lightdm.authentication_user, this.session));
        } else {
            this.stderr("incorrect password");
        }
    }
}

class commandHandler {
    constructor(commands, utils = null) {
        this.commands = commands;
        this.utils = (utils == null) ? new utils() : utils;
    }

    keys() {
        return Object.keys(this.commands);
    }

    exists(property) {
        return this.utils.hasProperty(this.commands, property) &&
            this.utils.hasProperty(this.commands[property], 'callback') &&
            this.utils.isFunction(this.commands[property].callback);
    }

    get(property) {
        return this.commands[property];
    }

    set(property, object) {
        if (this.utils.isEmpty(object)) {
            this.utils.except('Can not set empty');
        }

        if (!this.utils.hasProperty(object, 'callback') || !this.utils.isFunction(object.callback)) {
            this.utils.except('Can not set without a callback function');
        }

        this.commands[property] = object;
    }

    remove(property) {
        delete this.commands[property];
    }
}

class utils {
    constructor() {
        this.logger = document.getElementById('log');
    }

    isEmpty(value) {
        if (['', null, 'null', undefined, 'undefined'].includes(value)) {
            return true;
        }

        if (value instanceof Array) {
            return value.length === 0;
        } else if (value.constructor.name == 'object') {
            for (var property in value) {
                if (value.hasOwnProperty(property)) {
                    return false;
                }
            }

            return true;
        }
    }

    isFunction(value) {
        return (typeof value == 'function');
    }

    hasProperty(object, property) {
        if (this.isEmpty(object)) {
            return false;
        }

        return object.hasOwnProperty(property);
    }

    arrayOfObjectsHasKeyValue(arrayOfObjects, key, value) {
        let result = arrayOfObjects.filter(function (obj) {
            return obj[key] == value;
        });

        if (result.length > 0) {
            return result[0];
        }

        return false;
    }

    log(msg, log = false) {
        console.log(msg);

        if (log) {
            this.debug(msg);
        }
    }

    debug(msg) {
        if (!this.isEmpty(this.logger)) {
            this.logger.innerHTML += `<p class="log-error">${msg}</p>`;
        }
    }

    except(msg, log = true) {
        throw msg;

        if (log) {
            this.debug(msg);
        }
    }
}

$(window).on('load', () => {
    let terminal = new tty(commands);
});
