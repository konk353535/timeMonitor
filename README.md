#timeMonitor
Will monitor league of legends players played time by every 4 hours accessing there match history and appending all played games to a local db. Can then pull from this db to generate stats such as. Time played today, last 7 days, last month, Rankings for users for most played X champ, rankings for users for most played in {server}, Badges ect ect. The possibilties are endless

The first step in development is to get a solid backend, that can add new users, can users every set period of time, add game information about the user to mongodb

Current List to do - Today (View 24 hour day of players play time)
(1) Make a unique look for when there is no data for that day (mainly for the champion pie that doesn't appear)
(2) Error handling for today page 
		- What if the user doesn't exist?
		- If it's a new user, let them know we're fetching there data ASAP
		- Look at other possible avenues (how does the server react under load)
(3) In general clean up the today controller + html