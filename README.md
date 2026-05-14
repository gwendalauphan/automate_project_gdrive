# Google Drive Project Automation

This google app script project used within the google sheets file project helps you to manage and automate your google drive projects. The idea is that the user has to fill a form and answers questions related to its project. Once he finished to proceed with it, it'll generate sheet responses that he has to review, once he validate the answers,it'll generate a new project folder for its project. By default, it creates you a structure of files and informations based on the answers provided.


## How to use the tool into google drive ?

1. Go to the"Page principale"
2. Click to create a project from scratch or using a config
3. Answer the questions of the form
4. Review the answers in the "Validation" sheet
5. If you validate the answers, a new project folder will be created in your google drive

## How to contribute to the project ?

1. Create the structure and google sheets files of the project into your google drive
2. Import the .gs files into the google app script editor using clasp
3. Link the google sheets files to the google app script project
4. Develop your code and test it using the google app script editor


## How to develop into a google app script project ?
1. Go into the documentation: https://developers.google.com/apps-script/guides/clasp
2. Install clasp: npm install -g @google/clasp
3. Login to your google account: clasp login
4. Then you have multiple options to create a new project:
   - Create a new project: clasp create --title "Project Name"
   - Clone an existing project: clasp pull "Project ID"
   - Update an existing project: clasp push
   
