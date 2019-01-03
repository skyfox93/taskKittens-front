function addTaskList(list,container){
    list.showCompleted=true;

    const listCard= document.createElement('div')
    //lists.push(list);
    listCard.className="listCard"
    listCard.id=`list${list.id}`
    updateListCard(listCard,list,list.showCompleted)
    container.prepend(listCard)
    if(list.tasks.length>=1){determineFlip(list)}
  }
    // updates list card innerHTML
  function updateListCard(listCard, list,showCompleteTasks=false){
    const listHTML= list.tasks ? reduceTasks(list,false,showCompleteTasks) :''
    listCard.innerHTML= `
    <div class='listCard-inner'>
      <div class="listCard-front" data-type='listFace'>
        <div class="listCard-header"><span data-type='list-header' data-list_id="${list.id}" contenteditable="true">${list.title}</span><span class='list-icon-container'>
        <img class='list-icon' data-list_id="${list.id}" data-action='toggle-task-visible' src='${showCompleteTasks ? './icons/hide_icon.png': './icons/show_icon.png'}'>
        <span class='list-icon-tooltip'> ${showCompleteTasks ? 'hide' :'show'} completed Tasks</span>
        </span></div>
        <ul data-list_id="${list.id}"> ${listHTML} </ul> <form data-action='add-task' data-list_id="${list.id}"><input type="text" placeholder="enter a task" id="input${list.id}"><input type="submit" class="add-task" value="Add Task"> </form>
      </div>
      <div class='listCard-back' data-type='kittenFace'>
        <div class='listCard-header'><span>${list.title}</span><button class='list-header-btn' data-list_id="${list.id}" data-action='delete-list'> Delete </button></div>
        <div class='complete-label'><div> List complete! </div>
          <form data-action='add-task-back' data-list_id="${list.id}">
            <input type="text" placeholder="add another task" id="input-back${list.id}">
             <input type="submit" class="add-task" value="Add Task">
          </form>
        </div>
      </div>
    </div>`
    listCard.kitten=listCard.kitten ? listCard.kitten : `./kittenpics/kitten${Math.floor(Math.random()*10)}.jpeg`
    listCard.querySelector('div[data-type="kittenFace"]').style.backgroundImage=`url(${listCard.kitten})`
  }


  function refreshListUl(listId){
    const list=findList(listId,lists)
    const ulEl=document.querySelector(`#list${listId} ul`)
    const listHTML= list.tasks ? reduceTasks(list) :''
    ulEl.innerHTML=listHTML
  }





  function findList(id,lists){
    return lists.find((list)=> list.id==id)
  }

  function checkComplete(list){
    let boolean=list.tasks.find((task)=>task.complete!==true)? false : true
    return boolean
  }

  // this helper function checks wheter a list is complete and then shows the kitten accordingly
  function determineFlip(list,showCompletedLists){
    const list_id=list.id
    const listCard=document.getElementById(`list${list_id}`)
    if(checkComplete(list)){


      //  if we are viewing completed cards, keep it visible
      if(showCompletedLists){listCard.style.display='initial'; listCard.className='listCard-complete'}
      else{listCard.className='listCard-complete-hidden'
        // check if the (now complete) card was previously incomplete. if it has, set a timeout on display:none
        // (so that the animation renders). otherwise, hide the card imediately.
        if(list.complete==='no'){setTimeout(()=>listCard.style.display='none',1500)}
        else{listCard.style.display='none';console.log('hidden')}
      }
      list.complete= true
    }
    else{
     /*if(showCompletedLists){
        if the card is incomplete, previously marked as complete, and show completed is true
       if(list.complete===true){setTimeout(()=>listCard.style.display='none',1000)}
        if the card is incomplete, show completed is true, and it wasn't previously complete
       else{listCard.style.display='none';}
     }*/
       // if incomplete cards are being shown and the card is incomplete
     //else{listCard.style.display="initial"}
      list.complete= 'no' // so i know it's been initialized
      listCard.className='listCard'
    }
  }


// this function should match the task reducer innerHTML
