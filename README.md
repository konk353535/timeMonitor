#timeMonitor
Will monitor league of legends players played time by every 4 hours accessing there match history and appending all played games to a local db. Can then pull from this db to generate stats such as. Time played today, last 7 days, last month, Rankings for users for most played X champ, rankings for users for most played in {server}, Badges ect ect. The possibilties are endless

The first step in development is to get a solid backend, that can add new users, can users every set period of time, add game information about the user to mongodb

Current List to do
(1) Breakdown graphController into logical files
(2) Template the website using angular, (Use inbuilt angular templating)
(3) Generalize backend to format (sDate, eDate) so we can do custom graphs
	- So for championPie, multiDayGraph, and stats
	- All will take two dates as parameters and return based on that
	- This will make doing 7 day, monthly and all time graphs trivial :)