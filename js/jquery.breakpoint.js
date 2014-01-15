(function ($) {
	'use strict';

	var breakpoints = [];

	// Adds a breakpoint object with the following properties:
	//
	// condition   = a function returning a boolean for whether this breakpoint should be active or not.
	// first_enter = a function which will execute the FIRST TIME condition() is true.
	// enter       = a function which will execute everytime condition() turns from false to true.
	// exit        = a function which will execute everytime condition() turns from true to false.
	$.breakpoint = function (breakpoint, options) {

		options = $.extend(true, {}, $.breakpoint.defaults, options);

		breakpoints.push(breakpoint);

		// Activate event listeners when first breakpoint is added.
		if (breakpoints.length === 1) {
			$(window).on('resize orientationchange', function () {
				checkAllBreakpoints();
			});
		}

		checkSingleBreakpoint(breakpoint);

	};

	// Array of all added breakpoints.
	$.breakpoint.breakpoints = breakpoints;

	// Allow checking a single breakpoint from outside of plugin.
	$.breakpoint.check = function (breakpoint) {
		checkSingleBreakpoint(breakpoint);
	};

	// Default options.
	$.breakpoint.defaults = { /* none yet… */};

	function checkActiveBreakpoint(breakpoint) {
		if (!breakpoint.condition()) {

			// We have left this breakpoint.
			if (typeof breakpoint.exit === 'function') {
				try {
					breakpoint.exit.apply(breakpoint);
				} catch (e) {}
			}

			breakpoint.is_active = false;
		}
	}

	function checkInactiveBreakpoint(breakpoint) {
		if (breakpoint.condition()) {

			// We have entered this breakpoint.
			if (typeof breakpoint.first_enter === 'function') {
				try {
					breakpoint.first_enter.apply(breakpoint);
				} catch (e) {}

				// As this function is only meant to run once, remove it now.
				delete breakpoint.first_enter;
			}

			if (typeof breakpoint.enter === 'function') {
				try {
					breakpoint.enter.apply(breakpoint);
				} catch (e) {}
			}

			breakpoint.is_active = true;
		}
	}

	function checkSingleBreakpoint(breakpoint) {
		if (breakpoint.is_active) {
			checkActiveBreakpoint(breakpoint);
		}
		else {
			checkInactiveBreakpoint(breakpoint);
		}
	}

	// Loop through all breakpoints and determine which ones are active.
	function checkAllBreakpoints() {
		// Build temporary array of active breakpoints
		var active_breakpoints = $.grep(breakpoints, function (breakpoint) {
			return breakpoint.is_active;
		});

		// Build temporary array of inactive breakpoints.
		var inactive_breakpoints = $.grep(breakpoints, function (breakpoint) {
			return !breakpoint.is_active;
		});

		// Check all active breakpoints first.
		$.each(active_breakpoints, function (index, breakpoint) {
			checkActiveBreakpoint(breakpoint);
		});

		// Check all inactive breakpoints.
		$.each(inactive_breakpoints, function (index, breakpoint) {
			checkInactiveBreakpoint(breakpoint);
		});
	}

}(jQuery));