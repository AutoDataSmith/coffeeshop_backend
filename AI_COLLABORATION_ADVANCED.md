# Assignment 5 - How I tackled this project #

## Step 1 - Use environment variables in the project
Since this assignment intoduces the use of environment variables, I decided to create a git repository and add in a .gitignore file so that the .env file was clearly marked as ignored for security purposes. I also noticed that in assignment 6 - deployment / production, we are to use Render hostsing. I decided to incorporate parts of that in this assignment to lay the groundwork for the final deployment assignment.

AI Prompt 1 - Setting up a gitignore file
```
    In a .gitignore file, what are the common items to mark as excluded in a node.js backend project?  
```
**<span style="color:green">Results:</span>** [Prompt 1 results](AI_Prompt1_results.md)

AI Prompt 2 - Setting up application environment variables
```
for my node.js backend project, how do I set up environment variable usage? 
- I will be using Render for deployment for a student project so I wan to make sure any variables needed for that are considered
```
**<span style="color:green">Results:</span>** [Prompt 2 results](AI_Prompt2_results.md)

## Step 2 - Adding MongoDB atlas to the coffee backend project

```

I have a student node.js backend api project that I need to add MongoDB atlas for persistence 
The project has 3 main files:
- Class file called productManager.js
- Class file called orderManager.js
- server file called server.js
- routes defined in an orders.js file located in a routes folder. 
I have attached these files separately for reference. 
- I currently do not have a mongoDB atlas account so I would need instructions on setting that up.
- The mongoDB connection should have proper error handling implemented.
- The mongoDB connection should include reconnection logic.
- How should MongoDB connection failures and retries be handled?
Please keep the instructions clear but in a concise format.

```
**<span style="color:green">Results:</span>** [Prompt 3 results](AI_Prompt3_results.md)

**<span style="color:green">Reflection:</span>** After working with the AI assisted response, I was able to get a lot of the connection logic and mongoose schemas in place. However, introducing mongoose into the project brought in a whole bunch of questions that took wuite a while to works out.  The problem I ran into was the back and forth  process of promptin AI and adjusting code and adding comments was very difficult to document here. It was a bit chaotic.

Also, to make matters worse, the more I inquired AI about certain issues and concernes, the more bloated  the AI responses were to the sample code. I started to get off-track. I just started to focus just write code with soem good logging and debugging and I was able to get back on track again.

Bottom Line: AI is a great tool to get you up and started, however, keepingit on the same level and status as you project is in, the harded it worked against me. 
**It came to a point where I needed to pull up my developer big-boy pants and get to work.**

  