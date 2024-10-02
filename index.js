const express = require("express");
const app = express();

app.get("/", (req, res) => res.send("Timers on Vercel"));

app.listen(3000, () => console.log("Server ready on port 3000."));

module.exports = app;

app.get("/time/:time", (req, res) => {
    // Get the times from query parameters or request body
    let times = req.params.time || [];
    console.log("TIMES", times)
    if (times) {
        let timesArray = times.split('\n').map(time => time.trim()).filter(time => time !== '');
        console.log("timesArray", timesArray);
        
        let output = timesArray;

        console.log("output", output);

        times = output
    } else {
        res.send('No times provided');
    }
    // Example input
    // times = [
    //     "10:29 AM", "10:34 AM",
    //     "10:47 AM", "11:39 AM",
    //     "11:58 AM", "02:57 PM",
    //     "07:00 PM",
    //     "07:10 PM", "08:45 PM"
    // ];
    if (!times.length) {
        res.status(400);
        res.send("Please enter Time!")
        return;
    }
    function calculateTimeInside(times) {
        const inOutPairs = [];

        // Assuming times are alternating IN and OUT
        for (let i = 0; i < times.length; i += 2) {
            if (i + 1 < times.length) {
                inOutPairs.push({ in: times[i], out: times[i + 1] });
            }
        }

        let totalMinutes = 0;

        inOutPairs.forEach(pair => {
            const inTime = parseTime(pair.in);
            const outTime = parseTime(pair.out);

            if (!inTime || !outTime) {
                console.error(`Invalid time format: IN: ${pair.in}, OUT: ${pair.out}`);
                return;
            }

            // Calculate the difference in minutes
            const diff = (outTime - inTime) / (1000 * 60);
            totalMinutes += diff;
        });

        const totalHours = Math.floor(totalMinutes / 60);
        const remainingMinutes = totalMinutes % 60;

        // Total required time in minutes (8 hours 30 minutes)
        const requiredMinutes = 8 * 60 + 30;

        // Calculate the time when 8 hours and 30 minutes will be completed
        const currentTime = parseTime(times[times.length - 1]); // Use the last OUT time
        const timeToComplete = requiredMinutes - totalMinutes;

        if (timeToComplete > 0) {
            const completionTime = new Date(currentTime.getTime() + timeToComplete * 60000);
            const formattedCompletionTime = formatTime(completionTime);

            return {
                totalTime: `${totalHours} hours and ${remainingMinutes} minutes`,
                completionTime: formattedCompletionTime
            };
        } else {
            return {
                totalTime: `${totalHours} hours and ${remainingMinutes} minutes`,
                completionTime: 'Already completed 8 hours and 30 minutes'
            };
        }
    }

    // Helper function to parse time strings
    function parseTime(timeStr) {
        const [time, modifier] = timeStr.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        if (modifier === 'PM' && hours < 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        return date;
    }

    // Helper function to format completion time
    function formatTime(date) {
        let hours = date.getHours();
        const minutes = date.getMinutes();
        const amPm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12; // Convert to 12-hour format
        return `${hours}:${minutes.toString().padStart(2, '0')} ${amPm}`;
    }



    const result = calculateTimeInside(times);
    console.log(`Total time inside: ${result.totalTime}`);
    console.log(`You will complete 8 hours and 30 minutes by: ${result.completionTime}`);
    res.send(result);
    res.status(200);

});
