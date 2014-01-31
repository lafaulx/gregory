/*jshint
    browser:true,
    strict: false
*/

/*global jQuery*/

(function($, window, document, undefined) {

var daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
	defaultStartDay = "MON",
	defaultMessages = {
		year: "",
		months: {
			0: {
				s: "Jan",
				f: "January"
			},
			1: {
				s: "Feb",
				f: "February"
			},
			2: {
				s: "Mar",
				f: "March"
			},
			3: {
				s: "Apr",
				f: "April"
			},
			4: {
				s: "May",
				f: "May"
			},
			5: {
				s: "Jun",
				f: "June"
			},
			6: {
				s: "Jul",
				f: "July"
			},
			7: {
				s: "Aug",
				f: "August"
			},
			8: {
				s: "Sep",
				f: "September"
			},
			9: {
				s: "Oct",
				f: "October"
			},
			10: {
				s: "Nov",
				f: "November"
			},
			11: {
				s: "Dec",
				f: "December"
			},
		}
	};

var Gregory = function (opts) {
	var self = this;

	self.$b = $("<div class='gregory'></div>");
	self.$calendarWrapper;
	self.$dateInfo;
	self.$changeBack;
	self.$changeForward;
	self.modes = {
		day: "day",
		month: "month",
		year: "year"
	};
	self.displayState = {}; // {twelfth: 0..2013, year: 0..2013, month: 0..11, day: 1..31, mode: self.modes.month}
	self.selectedState = {}; // {year: 0..2013, month: 0..11, day: 1..31}
	self.prevFullState = {};
	self.weekStartDay = opts.weekStartDay || defaultStartDay;
	self.onDateSelect = opts.onDateSelect;
	self.messages = opts.messages || defaultMessages;
	self.viewReverse = opts.viewReverse;

	self.generateDOM();

	self.prevFullState.mode = self.modes.day;

	self.$b.on("mousedown.gregory", function(e) {
		e.stopPropagation();
	});

	self.$b.on("click.gregory", "a.change", function(e) {
		e.preventDefault();

		var $self = $(this),
			hash = this.hash.split("/"),
			year = parseInt(hash[0].substring(2), 10),
			month = parseInt(hash[1], 10),
			day = parseInt(hash[2], 10);

		var displayState = {};

		displayState.year = year;

		if (month === 0 || month) {
			displayState.month = month;
		}

		self.changeDisplayState(displayState, "dateChange");
	});

	self.$calendarWrapper.on("click.gregory", "a", function(e) {
		e.preventDefault();

		var $self = $(this),
			hash = this.hash.split("/"),
			year = parseInt(hash[0].substring(2), 10),
			month = parseInt(hash[1], 10),
			day = parseInt(hash[2], 10);

		self.changeSelectedState({
			year: year,
			month: month,
			day: day
		}, $self);

		self.onDateSelect && self.onDateSelect(self.selectedState);
	});

	self.$dateInfo.on("click.gregory", function(e) {
		e.preventDefault();

		var displayState = {};

		displayState.mode = this.hash.split('!')[1];

		if (displayState.mode === self.modes.day) {
			self.changeSelectedState(self.prevFullState);
		} else {
			if (self.displayState.month === null) {
				displayState.month = self.selectedState.month;
			} else {
				displayState.month = self.displayState.month;
			}

			if (!self.isYearActive(self.displayState.year) && self.displayState.mode === self.modes.month) {
				displayState.year = self.selectedState.year;
			}

			self.changeDisplayState(displayState);
		}
	});
};

Gregory.prototype = {
	init: function(state) {
		var self = this;

		if (state.date) {
			state.year = state.date.getFullYear();
			state.month = state.date.getMonth();
			state.day = state.date.getDate();
		}

		state.mode = state.day ? self.modes.day : self.modes.month;

		self.changeDisplayState(state);
		self.changeSelectedState(state);
	},
	changeDisplayState: function(displayState) {
		var self = this;

		self.setDisplayState(displayState);
		self.generateCalendar();
		self.updateInfo();
	},
	changeSelectedState: function(selectedState, $d) {
		var self = this;

		if (self.displayState.mode === self.modes.day) {
			self.$calendarWrapper.find(".active").removeClass("active");

			if (!$d) {
				var selector = "a[href='#!" + selectedState.year + (selectedState.month === 0 || selectedState.month ? ("/" + selectedState.month + (selectedState.day ? "/" + selectedState.day : "")) : "") + "']";

				$d = self.$calendarWrapper.find(selector);
			}

			$d.addClass("active");
		}

		self.setSelectedState(selectedState);
		self.updatePrevFullState();

		if (!selectedState.mode) {
			if (self.displayState.mode === self.modes.year) {
				selectedState.mode = self.modes.month;
			} else if (self.displayState.mode === self.modes.month) {
				selectedState.mode = self.modes.day;
			}
		}

		self.changeDisplayState(selectedState);
	},
	generateDOM: function() {
		var self = this,
			$dateInfoWrapper = $("<div class='date-info'><a href='#!'></a></div>");

		if (self.viewReverse) {
			self.$b.addClass("reverse");
		} else {
			self.$b.addClass("endian");
		}

		self.$calendarWrapper = $("<div class='wrapper'></div>");
		self.$dateInfo = $dateInfoWrapper.find("a");
		self.$changeBack = $("<a class='change back gregory-icon-left' href='#!'></a>");
		self.$changeForward = $("<a class='change forward gregory-icon-right' href='#!'></a>");

		self.$b.append(self.$calendarWrapper);
		self.$b.prepend($dateInfoWrapper);
		self.$b.prepend(self.$changeBack);
		self.$b.prepend(self.$changeForward);

		if (self.viewReverse) {
			self.$b.prepend(self.$calendarWrapper);
			self.$b.append($dateInfoWrapper);
			self.$b.append(self.$changeBack);
			self.$b.append(self.$changeForward);
		} else {
			self.$b.append(self.$calendarWrapper);
			self.$b.prepend($dateInfoWrapper);
			self.$b.prepend(self.$changeBack);
			self.$b.prepend(self.$changeForward);
		}
	},
	generateCalendar: function() {
		var self = this;

		if (self.displayState.mode === self.modes.day) {
			self.generateDayCalendar();
		} else if (self.displayState.mode === self.modes.month) {
			self.generateMonthCalendar();
		} else {
			self.generateYearCalendar();
		}
	},
	generateDayCalendar: function() {
		var self = this,
			firstDay = new Date(self.displayState.year, self.displayState.month, 1).getDay(),
			daysInMonth = self.getDaysInMonth(self.displayState.year, self.displayState.month),
			startingDay = self.weekStartDay === "MON" ? (firstDay === 0 ? 6 : firstDay - 1) : firstDay;

		var html = '<ul class="day">',
			day = 1,
			dateBack = self.decrementMonth(self.displayState.year, self.displayState.month),
			dateFuture = self.incrementMonth(self.displayState.year, self.displayState.month);


		self.setChange(dateBack.year + "/" + dateBack.month, dateFuture.year + "/" + dateFuture.month);

		for (var i = 0; i < 9; i++) {
			for (var j = 0; j <= 6; j++) {
				if (day <= daysInMonth && ((j >= startingDay && i === 0) || i > 0)) {
					html += "<li><a class='" + (self.isDayActive(day) ? "active" : "") + "' href='#!" + self.displayState.year + "/" + self.displayState.month + "/" + day + "'>" + day + "</a></li>";
					day++;
				} else if (day > daysInMonth) {
					break;
				} else {
					html += "<li></li>";
				}
			}

			if (day > daysInMonth) {
				break;
			}
		}

		html += '</ul>';

		self.$calendarWrapper.html(html);
	},
	generateMonthCalendar: function() {
		var self = this,
			html = '<ul class="month">',
			month = 0;

		self.setChange(self.displayState.year - 1, self.displayState.year + 1);

		for (var i = 0; i < 4; i++) {
			for (var j = 0; j <= 2; j++) {
				html += "<li><a class='" + (self.isMonthActive(month) ? "active'" : "") + "' href='#!" + self.displayState.year + "/" + month + "'>" + self.messages.months[month].s + "</a></li>";
				month++;
			}

			if (month > 11) {
				break;
			}
		}

		html += '</ul>';

		self.$calendarWrapper.html(html);
	},
	generateYearCalendar: function() {
		var self = this,
			html = '<ul class="year">',
			year = self.displayState.twelfth - 11;

		self.setChange(year - 1, self.displayState.twelfth + 12);

		for (var i = 0; i < 4; i++) {
			for (var j = 0; j <= 2; j++) {
				html += "<li><a class='" + (self.isYearActive(year) ? "active'" : "") + "' href='#!" + year + "'>" + year + "</a></li>";
				year++;
			}

			if (year > self.displayState.twelfth) {
				break;
			}
		}

		html += '</ul>';

		self.$calendarWrapper.html(html);
	},
	setChange: function(back, future) {
		var self = this;

		self.$changeBack.attr("href", "#!" + back);
		self.$changeForward.attr("href", "#!" + future);
	},
	setDateActive: function() {
		var self = this;

		self.$calendarWrapper.find("a[href='#!" + self.formUrl + "']").addClass("active");
	},
	decrementMonth: function(year, month) {
		var self = this,
			result = {};

		if (month === 0) {
			result.year = year - 1;
			result.month = 11;
		} else {
			result.year = year;
			result.month = month - 1;
		}

		return result;
	},
	incrementMonth: function(year, month) {
		var self = this,
			result = {};

		if (month === 11) {
			result.year = year + 1;
			result.month = 0;
		} else {
			result.year = year;
			result.month = month + 1;
		}

		return result;
	},
	getDaysInMonth: function(year, month) {
		var self = this;

		if(self.displayState.month === 1 && ((self.displayState.year % 4 === 0 && self.displayState.year % 100 !== 0) || self.displayState.year % 400 === 0)) {
			return 29;
		}
		return daysInMonth[self.displayState.month];
	},
	updateInfo: function() {
		var self = this,
			mode;

		if (self.displayState.mode === self.modes.day) {
			self.$dateInfo.html(self.messages.months[self.displayState.month].f + ", " + self.displayState.year);
		} else if (self.displayState.mode === self.modes.month) {
			self.$dateInfo.html(self.displayState.year + " " + self.messages.year);
		} else {
			self.$dateInfo.html(self.prevFullState.day + "." + (self.prevFullState.month + 1) + "." + self.prevFullState.year);
		}

		if (self.displayState.mode === self.modes.day) {
			mode = self.modes.month;
		} else if (self.displayState.mode === self.modes.month) {
			mode = self.modes.year;
		} else if (self.displayState.mode === self.modes.year) {
			mode = self.modes.day;
		}

		self.$dateInfo.attr("href", "#!" + mode);
	},
	setDisplayState: function(displayState) {
		var self = this;

		if (displayState.year) {
			self.displayState.year = displayState.year;
			self.displayState.twelfth = displayState.year;
		}

		if (displayState.month === 0 || displayState.month) {
			self.displayState.month = displayState.month;
		} else {
			self.displayState.month = null;
		}

		if (displayState.mode) {
			self.displayState.mode = displayState.mode;
		}

		if (!self.displayState.mode) {
			self.displayState.mode = displayState.month === 0 || displayState.month ? self.modes.day : self.modes.month;
		}
	},
	setSelectedState: function(selectedState) {
		var self = this;

		self.selectedState.year = selectedState.year;
		self.selectedState.month = selectedState.month;
		self.selectedState.day = selectedState.day ? selectedState.day : null;
	},
	updatePrevFullState: function() {
		var self = this;

		if (self.selectedState.day && (self.selectedState.month || self.selectedState.month === 0) && self.selectedState.year) {
			self.prevFullState.day = self.selectedState.day;
			self.prevFullState.month = self.selectedState.month;
			self.prevFullState.year = self.selectedState.year;
		}
	},
	isDayActive: function(day) {
		var self = this;

		return day === self.selectedState.day && self.displayState.month === self.selectedState.month && self.displayState.year === self.selectedState.year;
	},
	isMonthActive: function(month) {
		var self = this;

		return month === self.selectedState.month && self.displayState.year === self.selectedState.year;
	},
	isYearActive: function(year) {
		var self = this;

		return year === self.selectedState.year;
	},
	remove: function() {
		var self = this;

		self.$b.off(".gregory");
		self.$b.remove();
	}
};

window.Gregory = Gregory;

})(jQuery, window, document);
