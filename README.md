# Automation

personal Nodejs application for automating and linking several applications together

## Todos

- [ ] **In Progress** API that expose all the tech notes (blogs) from notion
  > Notion doesn't yet support all the block types. for instance Quote is not supported  
- [ ]  Automate shortcut for uploading picture of the day
- [ ]  sync together Notion Inbox DB & TickTick inbox ⇒ IFFF
  - [ ]  periodically check for out-of-sync problems
- ~~copy of Daiylo App~~
- [ ]  pocket finished Reads ⇒ dedicated notion DB

  > pocket doesn't provide an API for extracting highlights, so its kinda useless
  > **weekly script for extracting**

- [ ]  sync Twitter DB
  - [ ]  twitter sync followers
  - [ ]  tweets from phone
  - [ ]  auto publish tweets
- [ ]  PC pomodoro timer

## Done

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
