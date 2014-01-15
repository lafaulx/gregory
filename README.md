Gregory
=======

Gregory is a cool calendar with localisation support. It's built without old school table markup and returns selected date in a callback so you can simply process selected state. 

## Package content and installation

* css - some default css, needed for Gregory
* svg - svg icons, used in Gregory font
* font - font, composed of svg icons, described before
* js - Gregory script itself - original and uglified
* test - just test page - run it and check the plugin out 

Additional dependency to all that stuff - jQuery - looking forward to get rid of it.

## Initialization 
Gregory is initialized with some options and desired date and should be attached where you want in that way:
```js
var g = new Gregory(options);
g.init({
	date: new Date();
});

$("body").append(g.$b);
```

Gregory can be initialized with JS Date object (see example below) or state (day and month are optional - Gregory will be inited in corrected state):
```js
{
	day: int,
	month: int, 	// starts from 0
	year: int
}
```

g.$b - is a jQuery object with Gregory UI.

Options object looks like this:
```js
{
    onDateSelect: function(dateState) {    // selected state callback, state will be described further
        console.log(dateState);
    },
    weekDayStart: "MON" || "SUN",		   // optional, sets week start day - Monday default
    messages: {}						   // optional, localisation file - english month names default, will be described further
}
```

State object:
```js
{
	day: int,
	month: int, 	// starts from 0
	year: int
}
```

Messages object:
```js
{
	year: "string",
	months: {
		0: { 				// month names, 0..11
			s: "Jan",		// short name
			f: "January"	// full name
		}
	}
}

## Test page
Test page is provided in the package and requires no preparations - just open html and enjoy. Gregory modes are changed on headline click, months/years are switched on arrows click.

## Todo
* Date format friendly input