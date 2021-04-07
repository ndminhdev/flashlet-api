# NODE STARTER KIT

## Introduction

NodeJS Express Application pre-setup boilerplate with modules, utilities and best practices: NodeJS, Express, Mongoose, Babel, ESLint, Prettier, Unit testing with Mocha and Chai.

This starter kit comes with latest version of technologies such as Node 14+, Express 4, Mongoose 5, Babel 7,...

## Utilities
* Send email with Sendgrid
* Configure environment secrets with dotenv
* User Authentication with Passport.js
* Upload files with Cloudinary
* Logging with Winston

## Prerequisites
Install MongoDB, Node 14+ on your system.

## How to use

###### Step 1: Following one of two methods below
Method 1:
Click "Use this template" in this repository

Method 2:

Run the commands below
> git clone https://github.com/ndminhdev/node-starter.git
> cd node-starter

Install dependencies
> npm install

###### Step 2: Environment secrets configuration
Create a new file in root folder named ".env.development" (or ".env.production" for production mode). Copy content of ".env.example" and replace the example secrets with your application secrets.

##### Step 3: Run the application

Run the application
> npm start

Your application is default running at http://localhost:8080/v1. You can change the port in your secrets.



