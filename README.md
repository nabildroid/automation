# Automation

personal Nodejs application for automating and linking several applications together

## Todos

- [x]  pull up all completed tasks from TickTick and add the to your daily journal as a blocks
- [ ]  Automate shortcut for uploading picture of the day
- [x]  add task to Notion Inbox ubuntu
  1. make a keyboard shortcut E.g. SUPER+Q that execute

      ```bash
      gnome-terminal --hide-menubar  --geometry=80x20+350+150   -- bash quickNote.sh
      ```

  2. create a cronjob for

      ```bash
      30,0 * * * *  bash quickNote.sh -a
      ```

- [x]  screenshots to notion Inbox
- [ ]  sync together Notion Inbox DB & TickTick inbox ⇒ IFFF
  - [ ]  periodically check for out-of-sync problems
- [x] create a widget for showing ticktick statistics
  - endpoint for statistis => google sheets => google data studio => android app web widget
- [ ]  copy of Daiylo App
- [ ]  pocket finished Reads ⇒ dedicated notion DB
- [ ]  sync Twitter DB
  - [ ]  twitter sync followers
  - [ ]  tweets from phone
  - [ ]  auto publish tweets
- [ ]  PC pomodoro timer
