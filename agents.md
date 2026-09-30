# AGENTS.md - AI Coding Instructions
## Project Overview
This respository contains a web application game where you have to solve various binary-hex-decimal conversions and logical operations as quickly as you can in 30 seconds. Ex: 0xFFFF | 0x3F8C what is the result. This tests binary-hext-decimal conversion and operations (adding, subtracting) along with basic logical operations (and, not, or, xor) that could be given in different formats. 

## Environment & Tooling
- Always use 'npm'. Never run using 'yarn' or 'pnpm' commands
- Databse is Supabase using PostgreSQL
- Formatting: Using Prettier as a formatter for JavaScript

## ALWAYS
- Please write unit tests for any backend API endpoint that you incorporate into this project.
- Write short, imperative commit messages

## ASK FIRST
- Ask for permission before installing any third party applications.
- Propose and explain any architectural or database schema changes in the chat before modifying
- Warn about any major architectural or database changes you are implementing

## NEVER
- Never bypass pre-commit hooks
- Never commit or hardcode API keys, tokens, or secrets. Utilize .env or .env.example

## TECH STACK
- Frontend: React + Vite
- Backend: Node.js, Passport.js, ExpressJS
- 