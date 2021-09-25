#!/bin/bash

function backup(){
    fileName=$(echo "$RANDOM-note.txt")
    mkdir /home/nabil/.quickNotionNotes 2>/dev/null 
    echo "$1" > $(echo "/home/nabil/.quickNotionNotes/$fileName")
}

function sendData(){
    echo $1 | xargs -I{} curl -m 10 "$ENDPOINT"/newNotionInbox -H "content-type: application/json" -d '{"note":"{}"}'
}


if [[  $1 == "-a" ]]; then
    echo "uploading old files"

    if ping -q -c 1 -W 1 8.8.8.8 >/dev/null; then
        echo "uploading ..."

        for FILE in /home/nabil/.quickNotionNotes/*; do 
            content=$(cat $FILE)

            response=$(sendData "$content")
            isSucess=$(echo $response | grep "notion.so")  
            if [[ -n $isSucess ]]; then
                rm "$FILE"
            fi
        done

        echo "success :)"
    else   
        echo "no internet connection:("
    fi
else 
    echo "new quick note"

    read -p ""  note 

    {
        if ping -q -c 1 -W 1 8.8.8.8 >/dev/null; then
            response=$(sendData "$note")

            isSucess=$(echo $response | grep "notion.so")
            
            if [[ -z $isSucess ]]; then
               backup "$note"
            fi
        else
            backup "$note"
        fi
    }&
fi