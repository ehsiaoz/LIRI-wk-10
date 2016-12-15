
var request = require("request");
var inquirer = require("inquirer");
var keys = require('./keys.js');
var Twitter = require('twitter');
var fs = require("fs");
var SpotifyWebApi = require("spotify-web-api-node");


//logic to match users entered command in console with correct function

var command = process.argv[2];
var lookup = process.argv[3];
var artist = "";


switch (command) {
  case "my-tweets":
    mytweets(lookup);
    break;

  case "spotify-this-song":
    spotify(lookup);
    break;

  case "movie-this":
    movie(lookup);
    break;

  case "do-what-it-says":
    callLIRI();
    break;

  default:
  	console.log("Please enter a valid command: ");
	console.log("1. my-tweets {\"@twitterhandle\"}");
	console.log("2. spotify-this-song {\"album/artist\"}");
	console.log("3. movie-this {\"movie title\"}");
	console.log("4. do-what-it-says");
	break;
}


//Functions===============================================================

//Twitter: Show last 20 tweets for a particular twitter handle==========
function mytweets(handle) {

	//Twitter API Credentials================
	var twitterKeys = keys.twitterKeys;

	var client = new Twitter({
	  	consumer_key: twitterKeys.consumer_key,
		consumer_secret: twitterKeys.consumer_secret,
		access_token_key: twitterKeys.access_token_key,
		access_token_secret: twitterKeys.access_token_secret,
	});
	//===================================================

	var params = {screen_name: handle, count: 20};
	var header = "Last 20 Tweets for: " + params.screen_name

	//append the users command and tweet handle in the log file
	appendCommand();
	//append the title "last 20 tweets..." in log file
	appendResults(header);
	
	//call twitter api with credentials		
	client.get('statuses/user_timeline.json', params, function(error, tweets, response) {
  		if (!error) {
    		
    		console.log("Last 20 Tweets for: " + params.screen_name);
    		console.log("==============================")
    		//loop through each tweet object returned
    		tweets.forEach(function(tweet, i) {
    			//create a record with tweet time and text
    			var record = "(" + tweet.created_at +"): " + tweet.text
    			//append each tweet to log.txt file
				appendResults(record);
				console.log(record);
    		});
		 }

  		console.log(error);
	});

	
}

// //show the following information about the song in your terminal/bash window
// //Artist(s), The song's name, Preview link of song from spotify, album song is from
// //if no song provided default to "the sign" by Ace of Base

function spotify(song="The Sign") {

	//Spotify API Credentials=====================
	var spotifyKeys = keys.spotifyKeys;
	var spotifyApi = new SpotifyWebApi({
	
		clientID : spotifyKeys.clientID,
		clientSecret : spotifyKeys.clientSecret,
	});
	//================================================

	artist = process.argv[4] ? process.argv[4] : "Ace of Base";

	appendCommand();
	spotifyApi.searchTracks('track:' + song + ' artist: ' + artist).then(function(data) {
    	
    	
    	// console.log("data.body.tracks: ", data.body.tracks);
    	// console.log(data.body.tracks.items[0]);
    	// Print some information about the results
	    //console.log('I got ' + data.body.tracks.total + ' results!');
	  
	  	
	    // Go through the first page of results
	 	var firstPage = data.body.tracks.items;
	 	var artist = firstPage[0].artists[0].name;
	 	var song = firstPage[0].name;
	 	var album = firstPage[0].album.name;
	 	var trackNumber = firstPage[0].track_number;
	 	var spotifyURL = firstPage[0].external_urls.spotify


	 	console.log("Artist: ", artist)
	 	console.log("Song Name: ", song);
	 	console.log("Album: ", album);
	 	console.log("Track Number: ", trackNumber);
	 	console.log("Spotify URL: ", spotifyURL);
	  	
	  	var log = "Artist: " + artist + '\r\n' +  "Song Name: " + song + '\r\n' + "Album: " + album + '\r\n' +
					"Track Number: " + trackNumber + '\r\n' + "Spotify URL: " + spotifyURL
	  
	  	appendResults(log);
	  	//Code below is if you want multiple results and display multiple results
	 //  	firstPage.forEach(function(track, index) {
		// 	var log = index + ': ' + track.name + ' (' + track.popularity + ')'
		// 	// console.log(log);
		// 	appendResults(log);
		// });
	  	

		
	 
	  	}, function(err) {

	    	console.error('Something went wrong', err.message);
	  });

// spotifyApi.getArtist('5ksRONqssB7BR161NTtJAm')
//   .then(function(data) {
//     console.log('Artist information', data.body);
//   }, function(err) {
//     console.error(err);
//   });

// spotifyApi.getArtistAlbums('5ksRONqssB7BR161NTtJAm')
//   .then(function(data) {
//     console.log('Artist albums', data.body);
//   }, function(err) {
//     console.error(err);
//   });

// spotifyApi.getAlbumTracks('41MnTivkwTO3UUJ8DrqEJJ', { limit : 5, offset : 1 })
//   .then(function(data) {
//     console.log(data.body);
//   }, function(err) {
//     console.log('Something went wrong!', err);
//   });

// spotifyApi.getAlbumTracks('5UwIyIyFzkM7wKeGtRJPgB', { limit : 5, offset : 1 })
//   .then(function(data) {
//     console.log(data.body);
//   }, function(err) {
//     console.log('Something went wrong!', err);
//   });

// The Sign Song ID
// '0hrBpAOgrt8RXigk83LLNE'
	
}

//function to call omdb api
function movie(title) {

	//use request to make a get call to omdb
	request("http://www.omdbapi.com/?t=" + (title || "Mr. Nobody") + "&tomatoes=true&y=&plot=short&r=json", function(error, response, body) {

		if(!error && (response.statusCode === 200 || response.statusCode === 201)) {

			var title = JSON.parse(body).Title;
			var year = JSON.parse(body).Year;
			var imdbRating = JSON.parse(body).imdbRating;
			var country = JSON.parse(body).Country;
			var plot = JSON.parse(body).Plot;
			var actors = JSON.parse(body).Actors;
			var tomatoRating = JSON.parse(body).tomatoRating;
			var ratingURL = JSON.parse(body).tomatoURL;

			console.log("Title: " + title);
			console.log("Year: " + year);
			console.log("imdb Rating: " + imdbRating);
			console.log("Country: " + country);
			console.log("Plot: " + plot);
			console.log("Actors: " + actors);
			console.log("Tomatoes Rating: " + tomatoRating);
			console.log("Rating URL: " + ratingURL);
			//call append method to write to random.txt
			var log = "Title: " + title + '\r\n' +  "Year: " + year + '\r\n' + "imdb Rating: " + imdbRating + '\r\n' +
					"Country: " + country + '\r\n' + "Plot: " + plot + '\r\n' +
					"Actors: " + actors + '\r\n' + "Tomatoes Rating: " + tomatoRating + '\r\n' +
					"Rating URL: " + ratingURL

			//append the users command and movie title to log file
			appendCommand();
			//append the results returned from api to log file
			appendResults(log);
		}

		console.log("Please check the title of your movie");
	});

	
}

//using fs node package, take text inside of random.txt and the use to call one of LIRI's commands
function callLIRI() {

	fs.readFile("random.txt", "utf8", function(err, data) {
	  	var tempArray = data.split(",");
	 	var command = tempArray[0];
	 	var lookup = tempArray[1];

		if (command === "my-tweets") {
			mytweets(lookup);
		}

		else if (command === "spotify-this-song") {
			spotify(lookup);
		}

		else if (command === "movie-this") {
			movie(lookup);
		}

		else {
			console.log("Check entry in random.txt file");
		}
  	});
}


//Bonus
//Intead of logging out to console. output data to a .txt file called log.txt
function appendCommand() {

	if (command === "spotify-this-song") {
		var entry = "Command: " + command + " " + " Song: " + lookup + ", Artist: " + artist
		fs.appendFile("log.txt", "\r\n" + entry + "\r\n" + "---------------------------------------------", function(err) {
			console.log(entry);

			if (err) {
				console.log(err);
				return
			}

			console.log("Command Entry Added!")

		});	
	}
	else if (command === "my-tweets") {

		var entry = "Command: " + command + " Twitter Handle: " + lookup
		fs.appendFile("log.txt", "\r\n" + entry + "\r\n" + "---------------------------------------------", function(err) {
			console.log(entry);

			if (err) {
				console.log(err);
				return
			}

			console.log("Command Entry Added!")

		});

	}
	else if (command === "movie-this") {

		var entry = "Command: " + command + " Movie: " + lookup
		fs.appendFile("log.txt", "\r\n" + entry + "\r\n" + "---------------------------------------------", function(err) {
			console.log(entry);

			if (err) {
				console.log(err);
				return
			}

			console.log("Command Entry Added!")

		});
			
	}

}

function appendResults(log) {

	fs.appendFile("log.txt", "\r\n" + log + "\r\n", function(err) {
		// console.log(log);

		if (err) {
			console.log(err);
			return
		}

	});

}



