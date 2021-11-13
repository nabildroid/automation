# Automation

personal Nodejs application for automating and linking several applications together

## Todos

- [ ] API that expose all the tech notes (blogs) from notion
  > ~~Notion doesn't yet support all the block types. for instance Quote is not supported~~
  > https://developers.notion.com/changelog/callouts-and-quote-blocks-are-now-supported
- [ ]  Automate shortcut for uploading picture of the day

  
  
- [ ] Ubuntu Pomodoro widget in the top bar connected with ticktick pomodoro & allows the option to select a focus task 
  > gnome-shell offers js/css interface to build those custom stuff, [Example](https://github.com/paradoxxxzero/gnome-shell-system-monitor-applet/)
- [ ] Ubuntu Pomodoro widget in the top bar for showing your ticktick score and level
- [ ]  sync Twitter DB
  - [ ]  twitter sync followers
  - [ ]  tweets from phone
  - [ ]  auto publish tweets
- [ ]  PC pomodoro timer

## Done

- [x]  sync together Notion Inbox DB & TickTick inbox ⇒ IFFF
  + [x]  periodically check for out-of-sync problems

- [X]  pocket finished Reads ⇒ firestore
- [X] highlights to notion db
  > pocket doesn't provide an API for extracting highlights, so its kinda useless 

  > only me and pocket developers know what is "It will take more than a doctor to prescribe a remedy" 😎

- [X] API that expose Spaced Repetition DB from notion => consumed by [flashcards flutter application](https://github.com/nabildroid/flashcards)

- [x]  pull up all completed tasks from TickTick and add them to your daily journal as a blocks

- [X]  Report mode

- [x]  add task to Notion Inbox ubuntu #1
  1. make a keyboard shortcut E.g. SUPER+Q that execute

      ```bash
      gnome-terminal --hide-menubar  --geometry=80x20+350+150   -- bash quickNote.sh
      ```

  2. create a cronjob for

      ```bash
      30,0 * * * *  bash quickNote.sh -a
      ```


- [x]  screenshots to notion Inbox

- [x] create a [widget](https://datastudio.google.com/embed/reporting/d58d54aa-5a25-4392-bdaf-b80d3e3f45b7/page/tfcbC) for showing ticktick statistics
  - endpoint for statistics => google sheets => google data studio => android app web widget
