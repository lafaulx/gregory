Gregory
=======

Gregory is a cool calendar with localisation support. It's built without old school table markup and returns selected date in a callback so you can simply process selected state. 

## Package content and installation

* package/css - some default css, needed for Gregory
* package/svg - svg icons, used in Gregory font
* package/font - font, composed of svg icons, described before
* package/js - Gregory script itself
* src/less - source less
* src/js - source js
* test - just test page - run it and check the plugin out 

In case you want to change something in source files - you'll need to compile them afterwards. Source files can be compiled with cool Fuller tool:
```
npm install 		// installs Fuller itself - node.js required
fuller 				// compiles source files
```

In case you don't want to install Fuller - then act as you like.

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
    viewReverse: bool,					   // reverses Gregory view if true - controls and info will be at the bottom and dates - at the top
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
```

## Test page
Test page is provided in the package and requires no preparations - just open html and enjoy. Gregory modes are changed on headline click, months/years are switched on arrows click.

## Todo
* Date format friendly input