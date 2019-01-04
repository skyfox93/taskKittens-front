
document.addEventListener('DOMContentLoaded', function(){

  ///// Application level Variables //////////

  let userId=3; // reasigned when user changes
  let showCompletedLists=false
  let lists=[]  // reassigned after initial fetch
  const noDueDate=document.getElementById('no-date-button') // displays under datepicker
  const dateInput=document.querySelector('#date-input') // invisible element to hold date input
  const container=document.getElementById('main') // holds listCards
  const adapter=Adapter('http://localhost:3000/api/v1')
  // establish datepicker instance. It submits a patch request when clicked.

  const picker=datepicker('#date-input',{ alwaysShow: true, onSelect: (instance, date) => {
    pickerEl.style.display="none";
    const id= dateInput.dataset.id
    const dateVal=dateInput.value
    noDueDate.style.display="none";
    picker.setDate()
    const taskEl= document.querySelector(`#task${id}`)
    const calTask=document.querySelector(`#task-cal${id}`)
    const foundTask=findTask(id,lists)
    foundTask.due_date=dateVal
    renderTask(taskEl,foundTask,lists)
    if(calTask){renderCalendar(lists,container)}
    adapter.patchTask(id,{task:{due_date: dateVal}})
  }})
  const pickerEl=document.querySelector('.qs-datepicker') // the datepicker element



  ///// run on initialization//////////

  pickerEl.style.display="none"
  init()

  // misc helpers
  function init(){
    adapter.get(userId).then(data=> {
      renderWelcome(container);
      const welcomeMessage=document.getElementById('welcome')
      lists=data
      if(lists.length>0){data.forEach((list)=>{
          welcomeMessage.style.display='none';addTaskList(list,container)
      })}
    })
  }

  function renderWelcome(container){
      container.innerHTML= '<h2 id="welcome">Welcome! Add a list to get started</h2>'
    }


  function switchUser(container){
    container.innerHTML=''
    userId=document.querySelector('#change-user').value
    init();
  }

  function closeCal(){
  document.querySelector('#calendar').innerHTML=''
  document.querySelector('#calendar').style.marginTop='-10px'
  container.classList.remove('blur')
}

//// eventListeners///////
  function handleClick(event){
    // if the user marked a task as complete, toggle completeness and send patch request
    if (event.target.dataset.action==="complete"){
      // retrieve elements to update
      const taskId= event.target.dataset.id
      const listTask=document.getElementById(`task${taskId}`)
      const calTask=document.querySelector(`#task-cal${taskId}`)
      // update task completeness
      let foundTask=findTask(taskId,lists)
      if(foundTask.complete){
        foundTask.complete=false;}
      else {foundTask.complete=true;}
      // update html
      renderTask(listTask,foundTask,lists);
      if(calTask){renderTask(calTask,foundTask,lists,true)}


      const list_id = event.target.dataset.list_id
      const  foundList=findList(list_id,lists);
      // the determineFlip function applies styles and hides and shows the list based on the showCompletedLists variable
      determineFlip(foundList,showCompletedLists)
      //update the database
      adapter.patchTask(taskId,{task:{complete: foundTask.complete}})
    }
    // if the user marked a task priority, toggle priority and send patch request
    if(event.target.dataset.action==='star'){
      const id= event.target.dataset.id
      const foundTask=findTask(id,lists)
      if(foundTask.priority){
        foundTask.priority=false;
        event.target.src='./icons/unstar.png'
      }
      else {
        foundTask.priority=true;
        event.target.src='./icons/staricon.png'
      }
      adapter.patchTask(id,{task:{priority: foundTask.priority}})
      .then((task)=> {console.log(task);
        const taskEl=document.querySelector(`#task${id}`)
        renderTask(taskEl,task,lists,false)
        const calTask=document.querySelector(`#task-cal${id}`)
        if(calTask){renderTask(calTask,task,lists,true)}
      })
    }
    // if the user changes the due date on a task
    if(event.target.dataset.action==='set_date'){
      // show the event picker
      pickerEl.style.display="initial"
      pickerEl.style.top=event.clientY-100+'px'
      pickerEl.style.left=event.clientX-100+'px'
      // show the no-date option
      noDueDate.style.display='inline-block'
      noDueDate.style.top=event.clientY+110+'px';
      noDueDate.style.left=event.clientX-80+'px';
      //send the task id to the dateInput
        // note: see datepicker variable for what happens after
      dateInput.dataset.id=event.target.dataset.id
    }
      // if the user choose 'no date' on a task
    if (event.target.dataset.action==='no-date'){
      pickerEl.style.display="none";
      const id= dateInput.dataset.id;
      const dateVal=null;
      noDueDate.style.display="none";
      picker.setDate()
      const taskEl= document.querySelector(`#task${id}`)
      const calTask=document.querySelector(`#task-cal${id}`)
      const foundTask=findTask(id,lists)
      foundTask.due_date=dateVal
      renderTask(taskEl,foundTask,lists)
      if(calTask){renderTask(calTask,foundTask,lists,true)}
      adapter.patchTask(id,{task:{due_date: dateVal}})
    }
      // if the user is adding a task


      // if user is removing a task
    if(event.target.dataset.action==='remove-task'){
       const id=event.target.dataset.id
       const list_id=event.target.dataset.list_id

       const choice=confirm('Really delete this task?')
       if (choice){
         // remove task from list of tasks to display
        const foundList=findList(list_id,lists)
        const index=foundList.tasks.findIndex((task)=> task.id==id)
        foundList.tasks.splice(index,1)

        // remove task from list and from calendar view
        const taskEl=document.querySelector(`#task${id}`)
        taskEl.remove()
        const calTask=document.querySelector(`#task-cal${id}`)
        if(calTask){calTask.remove();}
        adapter.deleteTask(id).then(console.log)
        }

    }
      // if the user is toggling the calendar
    if(event.target.dataset.action==='show-cal'){
      renderCalendar(lists,container);

    }
    if(event.target.dataset.action==="close-cal"){
    closeCal()
    }
    if (event.target.dataset.action=='show-completed'){
      if(event.target.dataset.toggle==='true'){
        event.target.dataset.toggle=false;
        event.target.textContent='Show Completed Lists';
        showCompletedLists=false;
        const completeCards=document.querySelectorAll('.listCard-complete')
        const incompleteCards=document.querySelectorAll('.listCard')

        completeCards.forEach(function(listCard){listCard.className="listCard-complete-hidden";setTimeout(()=>listCard.style.display='none',800)})

        incompleteCards.forEach(function(listCard){listCard.style.display='initial'});
      }
      else{
        event.target.textContent='Hide Completed Lists';
        event.target.dataset.toggle=true;
        showCompletedLists=true;
        const listCards=document.querySelectorAll('.listCard-complete-hidden')
        const incompleteCards=document.querySelectorAll('.listCard')
        listCards.forEach(function(listCard){listCard.style.display='block';listCard.className="listCard-complete";})
        /*incompleteCards.forEach(function(listCard){setTimeout(()=>listCard.style.display='none',800)})*/;

      }
    }
    if (event.target.dataset.action==='delete-list'){
      const choice=confirm('really delete the whole list?')
      if(choice){
        const listId=event.target.dataset.list_id
        adapter.deleteList(listId);
        document.querySelector(`#list${listId}`).remove();

      }
    }
    if(event.target.dataset.action==='toggle-task-visible'){
      const listId=event.target.dataset.list_id
      const foundList=findList(listId,lists)
      const listCard=document.querySelector(`#list${listId}`)
      if(foundList.showCompleted){
        foundList.showCompleted=false;
      }
      else{foundList.showCompleted=true;}
      updateListCard(listCard,foundList,foundList.showCompleted)
    }


    if(event.target.dataset.action==='quickfind'){
    const quickfindC=document.querySelector('#quickfind')
    closeCal()
    renderQuickFind(lists,quickfindC,container,showCompletedLists);
    }

    if(event.target.dataset.action==='jump-to-list'){
    container.classList.remove('blur')
    const id=event.target.dataset.id
    console.log('ID is', id)
    const task=document.querySelector(`#list${id}`)
    const rect=task.getBoundingClientRect();
    let height=window.scrollY+rect.top
    height-=50
    const quickfindC=document.querySelector('#quickfind')
    quickfindC.style.marginTop='-500px';
    window.scrollTo(0,height)
    }



  }
  function handleSubmit(event){
    event.preventDefault()
    if(event.target.id==='add-list-form'){
      const input= document.querySelector(`#list-input`)
      const title=input.value
      event.target.reset()
      adapter.createList(userId,{list:{user_id: userId, title: title}})
      .then((list)=>{
        lists.push(list);
        addTaskList(list);

      })
    }

    if(event.target.dataset.action==='add-task'){
      const list_id=event.target.dataset.list_id
      const input= document.querySelector(`#input${list_id}`)
      const title=input.value
      if (input.value==='')
        {alert('task cannot be blank!')}
      else{input.value=''
        adapter.createTask({task:{list_id: list_id, title: title,note: null, due_date: null, priority: false, complete: false}})
        .then((task)=>{
          const newLi=document.createElement('li')
          newLi.className=task.complete ? 'task complete' : 'task'
          const list_id=event.target.dataset.list_id
          const ulEl=document.querySelector(`#list${list_id} ul`)
          renderTask(newLi, task,lists)
          ulEl.appendChild(newLi);

          ///update list object with new task
         const foundList=findList(list_id,lists)
         foundList.tasks.push(task)
         determineFlip(foundList,showCompletedLists)
       })
      }
    }
    if(event.target.dataset.action==='add-task-back'){
      const list_id=event.target.dataset.list_id
      const input= document.querySelector(`#input-back${list_id}`)
      const title=input.value
      if (input.value==='')
        {alert('task cannot be blank!')}
      else{
        input.value=''
        adapter.createTask({task:{list_id: list_id, title: title,note: null, due_date: null, priority: false, complete: false}})
        .then((task)=>{
          console.log(task);
          const newLi=document.createElement('li')
          newLi.dataset.id=task.id
          newLi.id='task'+task.id
          newLi.className=task.complete ? 'task complete' : 'task'
          const list_id=event.target.dataset.list_id
          const ulEl=document.querySelector(`#list${list_id} ul`)
          renderTask(newLi, task,lists)
          ulEl.appendChild(newLi);
          /// update list object
          const foundList=findList(list_id,lists)
          foundList.tasks.push(task)
          determineFlip(foundList,showCompletedLists)

        })
      } // end else for input being blank
    }

  }
  function handleKeyDown(event){

    if (event.target.dataset.type==='list-header' && event.key=='Enter'){
      event.preventDefault()
      event.target.blur()
      const list_id= event.target.dataset.list_id
      const listCard=document.querySelector(`#list${list_id}`)
      const title=event.target.textContent
      const foundList=findList(list_id,lists)
      foundList.title=title
      adapter.patchList(list_id,{list:{user_id:userId,title: title}})
      .then((list)=> {console.log(list);})
    }
    // if the user is editing a task's title
    if (event.target.dataset.action==='edit-task-title' && event.key=='Enter'){
      event.preventDefault()
      const id= event.target.dataset.id
      const title=event.target.textContent
      // update title object in the list array
      const foundTask=findTask(id,lists)
      foundTask.title=title
      // rerender tasks in both views, since we don't know which view a user is editing from
      const taskEl=document.querySelector(`#task${id}`)
      renderTask(taskEl,foundTask,lists)
      const calTask=document.querySelector(`#task-cal${id}`)
      if(calTask){renderTask(calTask,foundTask,lists)}
      //update the title in the database
      adapter.patchTask(id,{task:{title: title}})
    }
  }
  function handleBlur(event){
    console.log(event.target)
    if (event.target.dataset.type==='list-header'){
      event.preventDefault()
      event.target.blur()
      const list_id= event.target.dataset.list_id
      const listCard=document.querySelector(`#list${list_id}`)
      const title=event.target.textContent
      adapter.patchList(list_id,{list:{user_id:userId,title: title}})
      .then((list)=> {console.log(list);})
    }
    // if the user is editing a task's title
    if (event.target.dataset.action==='edit-task-title'){
      event.preventDefault()
      const id= event.target.dataset.id
      const title=event.target.textContent
      // update title object in the list array
      const foundTask=findTask(id,lists)
      foundTask.title=title
      // rerender tasks in both views, since we don't know which view a user is editing from
      const taskEl=document.querySelector(`#task${id}`)
      renderTask(taskEl,foundTask,list)
      const calTask=document.querySelector(`#task-cal${id}`)
      if(calTask){renderTask(calTask,foundTask,list,true)}
      //update the title in the database
      adapter.patchTask(id,{task:{title: title}})
    }
  }


  document.addEventListener('click', handleClick)
  document.addEventListener('submit', handleSubmit)
  document.addEventListener('keydown',handleKeyDown)
  document.addEventListener('focusout',handleBlur)
  document.querySelector('#change-user').addEventListener('change',switchUser)
})
