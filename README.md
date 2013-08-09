#unitsCalc

I implemented this library to solve the problem of calculating CSS style using different units (%,pt,in, ...). This has a huge benefit when working responsively.

I found out after working on this first draft that there is a standard function surprinsingly called 'calc' too O_o which will do the same thing. For the time being it's not widely supported so you may give unitsCalc a try.

##Usage:
'''
SELECTOR  {
    ...
    property: calc(EXPRESSION); //can't be used in composite properties
    ...
}
'''

##TODO:
1- Cross-browsers support.
2- Recalculate when window resized.
3- General improvements.