
document.addEventListener('DOMContentLoaded', function(){
// establish datepicker instance. It submits a patch request when clicked.
const picker=datepicker('#date-input',{ alwaysShow: true, onSelect: (instance, date) => {
pickerEl.style.display="none";
const id= dateInput.dataset.id
const dateVal=dateInput.value
noDueDate.style.display="none";
picker.setDate()
const taskEl= document.querySelector(`#task${id}`)
const calTask=document.querySelector(`#task-cal${id}`)
const foundTask=findTask(id)
foundTask.due_date=dateVal
renderTask(taskEl,foundTask)
if(calTask){renderTask(calTask,foundTask)}
adapter.patchTask(id,{task:{due_date: dateVal}})
}})
// paramaters
let userId=3;
let showCompletedLists=false


// define Dom elemements
  const noDueDate=document.getElementById('no-date-button')
  const pickerEl=document.querySelector('.qs-datepicker')
  pickerEl.style.display="none"
  const dateInput=document.querySelector('#date-input')
  const container=document.getElementById('main')
  const adapter=Adapter('http://localhost:3000/api/v1')
  //const adapter=Adapter('192.168.0.11:3000/api/v1')

  let lists=[] // reassigned after first fetch

  function init(){
  adapter.get(userId).then(data=> {
    renderWelcome();
    lists=data
    if(lists.length>0){data.forEach((list)=>addTaskList(list))}
  })}

  function renderWelcome(){
    container.innerHTML= '<h2 id="welcome">Welcome! Add a list to get started</h2>'
  }

  init();

  // adds new listCard to DOM
  function addTaskList(list){
    const welcomeMessage=document.getElementById('welcome')
    welcomeMessage.style.display='none';
    const listCard= document.createElement('div')
    //lists.push(list);
    listCard.className="listCard"
    listCard.id=`list${list.id}`
    updateListCard(listCard,list)
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
        <img class='list-icon' data-list_id="${list.id}" data-action='toggle-task-visible' src='${showCompleteTasks ? './hide_icon.png': './show_icon.png'}'>
        <span class='list-icon-tooltip'> Show/hide completed Tasks</span>
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
    const list=findList(listId)
    const ulEl=document.querySelector(`#list${listId} ul`)
    const listHTML= list.tasks ? reduceTasks(list) :''
    ulEl.innerHTML=listHTML
  }

  function reduceTasks(list,calView=false,showComplete=false){
    const listHTML= calView ? list.reduce(taskReducer, '') : list.tasks.reduce(taskReducer,'')
    return listHTML

    function taskReducer(taskHTML,task){
      // if the user set a due date, add it to the html, otherwise, add placeholder text
      let dateString=''
        // if it has a due date, convert it to a date, check if its overdue, and mark it it as overdue
      if(task.due_date){
        const date=new Date(task.due_date)
        dateString= date.toDateString().slice(0,10)
      }
      else{dateString='no due date'}
        // check for title, asign the title
      const title= task.title ? task.title : 'enter text here'
      // calendar view shows the list title as well as the task
      const listTitle= calView ? `<span>${task.listTitle}<span>` : ''
      //  task has a conditional class
      const taskClass= task.complete ? (showComplete ? 'complete-show' : 'complete' ) : 'task'
      return taskHTML +
        // html for  individual task
        // li innerHTML should match renderTask
      `<li data-id="${task.id}" id="${calView ? 'task-cal'+task.id :'task'+task.id}" class="${taskClass}">
        <input type="checkbox" data-action="complete" data-id="${task.id}" ${task.complete ? 'checked' : ''} data-list_id="${task.list_id}">
        <img src="${task.priority ? 'staricon.png' :'./unstar.png'}" class="icon" data-action="star" data-id="${task.id}">
        <span class="task_title" data-action="edit-task-title" data-id="${task.id}" contenteditable="true">${title}</span>
        ${listTitle}
        <span class="date" data-action="set_date" data-list="list${task.list_id}" data-id="${task.id}">${dateString}</span>
        <button class="remove" data-action="remove-task" data-id="${task.id}" data-list_id='${task.list_id}'>X</button>


      </li>`
    }
  }

  function findTask(id){
    let task={}
    lists.forEach((list)=>{
      let temptask=list.tasks.find((task)=> task.id == id)
      if (temptask){task=temptask}
    })
    return task
  }

  function findList(id){
    return lists.find((list)=> list.id==id)
  }

  function checkComplete(list){
    let boolean=list.tasks.find((task)=>task.complete!==true)? false : true
    return boolean
  }

  // this helper function checks wheter a list is complete and then shows the kitten accordingly
  //  uses a hidden input, showCompletedLists, a boolean
  function determineFlip(list){
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
     if(showCompletedLists){
       // if the card is incomplete, previously marked as complete, and show completed is true
      // if(list.complete===true){setTimeout(()=>listCard.style.display='none',1000)}
       // if the card is incomplete, show completed is true, and it wasn't previously complete
       //else{listCard.style.display='none';}
     }
       // if incomplete cards are being shown and the card is incomplete
     //else{listCard.style.display="initial"}
      list.complete= 'no' // so i know it's been initialized
      listCard.className='listCard'
    }
  }

  function renderTask(el,task,calView=false){
    // if the user set a due date, add it to the html, otherwise, add placeholder text
    let dateString=''

      // if it has a due date, convert it to a date, check if its overdue, and mark it it as overdue
    if(task.due_date){
      const date=new Date(task.due_date)
      dateString= date.toDateString().slice(0,10)
    }
    else{dateString='no due date'}
    const title= task.title ? task.title : 'enter text here'
    const listTitle= calView ? `<span>${task.listTitle}<span>` : ''
    el.innerHTML=`
    <input type="checkbox" data-action="complete" data-id="${task.id}" ${task.complete ? 'checked' : ''} data-list_id="${task.list_id}">
    <img src="${task.priority ? 'staricon.png' :'./unstar.png'}" class="icon" data-action="star" data-id="${task.id}">
    <span class="task_title" data-action="edit-task-title" data-id="${task.id}" contenteditable="true">${title}</span>
    ${listTitle}
    <span class="date" data-action="set_date" data-list="list${task.list_id}" data-id="${task.id}">${dateString}</span>
    <button class="remove" data-action="remove-task" data-id="${task.id}" data-list_id='${task.list_id}'>X</button>
        `;
  }
  function flattenedTasks(){
    const tasks=[]
    // for each list, iterate through the tasks, and push them to tasks
    // also, save the list title for later display
    lists.forEach(function(list){
      list.tasks.forEach(function(task){
        task.listTitle=list.title;
        tasks.push(task)
      })
    })
    return tasks
  }
  function renderQuickFind(){
    debugger
    const quickfindC=document.querySelector('#quickfind')
    function listReducer(listHTML,list){return listHTML +`<li class='linkItem'><a href="#list${list.id}"> ${list.title}</a></li>`}

    quickfindC.innerHTML=`<ul>${lists.reduce(listReducer,'')}</ul>`
    quickfindC.style.marginTop='50px';
  }

  function renderCalendar(){
    container.classList.add('blur')
    document.querySelector('#calendar').style.marginTop='50px';

    //  select the tasks with a due date
    let sorted=flattenedTasks().filter((task)=> !!task.due_date).filter((task)=>!task.complete)
    // group the tasks by date
    let dates = {}
    sorted.forEach((task)=> {
      if(dates[task.due_date]){dates[task.due_date].push(task)}
      else{dates[task.due_date]=[task]}
    })
    // convert the object to an array. with form [date,[tasks]]
     const events=Object.entries(dates)
     //sort the array by date
     events.sort(function(a,b){
        let date1= new Date(a[0])
        let date2= new Date(b[0])
        return date1-date2
     })
    // iterate through the array, creating html for the date and for the tasks
    function eventsReducer(eventsHTML,event){
      return eventsHTML + `<div>${event[0]}</div><ul>${reduceTasks(event[1],true)}</ul>`
    }
    document.querySelector('#calendar').innerHTML="<div class='calBanner' data-action='close-cal'> Close </div>"+events.reduce(eventsReducer,'')
  }
    /*document.querySelector('#calendar').innerHTML=`<div data-action='close-cal'> Close </div><ul>${reduceTasks(sorted,true)}</ul>`
  }*/

  function handleClick(event){
    // if the user marked a task as complete, toggle completeness and send patch request
    if (event.target.dataset.action==="complete"){
      // retrieve elements to update
      const taskId= event.target.dataset.id
      const listTask=document.getElementById(`task${taskId}`)
      const calTask=document.querySelector(`#task-cal${taskId}`)
      // update task completeness
      let foundTask=findTask(taskId)
      if(foundTask.complete){
        foundTask.complete=false;}
      else {foundTask.complete=true;}
      // update html
      listTask.classList.toggle('complete')
      renderTask(listTask,foundTask);
      if(calTask){calTask.classList.toggle('complete');renderTask(calTask,foundTask,true)}

      // show the kitten if the list is complete
      const list_id = event.target.dataset.list_id
      const  foundList=findList(list_id);
      // the determineFlip function applies styles and hides and shows the list based on the showCompletedLists variable
      determineFlip(foundList)
      //update the database
      adapter.patchTask(taskId,{task:{complete: foundTask.complete}})
    }
    // if the user marked a task priority, toggle priority and send patch request
    if(event.target.dataset.action==='star'){
      const id= event.target.dataset.id
      const foundTask=findTask(id)
      if(foundTask.priority){
        foundTask.priority=false;
        event.target.src='./unstar.png'
      }
      else {
        foundTask.priority=true;
        event.target.src='./staricon.png'
      }
      adapter.patchTask(id,{task:{priority: foundTask.priority}})
      .then((task)=> {console.log(task);
        const taskEl=document.querySelector(`#task${id}`)
        renderTask(taskEl,task)
        const calTask=document.querySelector(`#task-cal${id}`)
        if(calTask){renderTask(calTask,task)}
      })
    }

      // if the user clicked a due date, send the task id to the dateInput
    if(event.target.dataset.action==='set_date'){
      // show the event picker
      pickerEl.style.display="initial"
      pickerEl.style.top=event.clientY-100+'px'
      pickerEl.style.left=event.clientX-100+'px'
      noDueDate.style.display='inline-block'
      noDueDate.style.top=event.clientY+110+'px';
      noDueDate.style.left=event.clientX-80+'px';

      dateInput.dataset.id=event.target.dataset.id
    }

    if (event.target.dataset.action==='no-date'){
      pickerEl.style.display="none";
      const id= dateInput.dataset.id;
      const dateVal=null;
      noDueDate.style.display="none";
      picker.setDate()
      const taskEl= document.querySelector(`#task${id}`)
      const calTask=document.querySelector(`#task-cal${id}`)
      const foundTask=findTask(id)
      foundTask.due_date=dateVal
      renderTask(taskEl,foundTask)
      if(calTask){renderTask(calTask,foundTask)}
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
        const foundList=findList(list_id)
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
      renderCalendar(container);

    }
    if(event.target.dataset.action==="close-cal"){
      document.querySelector('#calendar').innerHTML=''
      document.querySelector('#calendar').style.marginTop='-10px'
      container.classList.remove('blur')
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
      const foundList=findList(listId)
      const listCard=document.querySelector(`#list${listId}`)
      if(foundList.showCompleted){
        foundList.showCompleted=false;
      }
      else{foundList.showCompleted=true;
}
      updateListCard(listCard,foundList,foundList.showCompleted)
    }
    if(event.target.dataset.action==='quickfind'){
    renderQuickFind();
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
          console.log(task);
          const newLi=document.createElement('li')
          newLi.dataset.id=task.id
          newLi.id='task'+task.id
          newLi.className=task.complete ? 'task complete' : 'task'
          const list_id=event.target.dataset.list_id
          const ulEl=document.querySelector(`#list${list_id} ul`)
          renderTask(newLi, task)
          ulEl.appendChild(newLi);

          ///update list object with new task
         const foundList=findList(list_id)
         foundList.tasks.push(task)
         determineFlip(foundList)
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
          renderTask(newLi, task)
          ulEl.appendChild(newLi);
          /// update list object
          const foundList=findList(list_id)
          foundList.tasks.push(task)
          determineFlip(foundList)
        })
      }
    }

  }
  function handleKeyDown(event){

    if (event.target.dataset.type==='list-header' && event.key=='Enter'){
      event.preventDefault()
      event.target.blur()
      const list_id= event.target.dataset.list_id
      const listCard=document.querySelector(`#list${list_id}`)
      const title=event.target.textContent
      adapter.patchList(list_id,{list:{user_id:userId,title: title}})
      .then((list)=> {console.log(list);})
    }
    // if the user is editing a task's title
    if (event.target.dataset.action==='edit-task-title' && event.key=='Enter'){
      event.preventDefault()
      const id= event.target.dataset.id
      const title=event.target.textContent
      // update title object in the list array
      const foundTask=findTask(id)
      foundTask.title=title
      // rerender tasks in both views, since we don't know which view a user is editing from
      const taskEl=document.querySelector(`#task${id}`)
      renderTask(taskEl,foundTask)
      const calTask=document.querySelector(`#task-cal${id}`)
      if(calTask){renderTask(calTask,foundTask)}
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
      const foundTask=findTask(id)
      foundTask.title=title
      // rerender tasks in both views, since we don't know which view a user is editing from
      const taskEl=document.querySelector(`#task${id}`)
      renderTask(taskEl,foundTask)
      const calTask=document.querySelector(`#task-cal${id}`)
      if(calTask){renderTask(calTask,foundTask)}
      //update the title in the database
      adapter.patchTask(id,{task:{title: title}})
    }
  }

  function switchUser(container){
    container.innerHTML=''
    userId=document.querySelector('#change-user').value
    init();
  }

  document.addEventListener('click', handleClick)
  document.addEventListener('submit', handleSubmit)
  document.addEventListener('keydown',handleKeyDown)
  document.addEventListener('focusout',handleBlur)
  document.querySelector('#change-user').addEventListener('change',switchUser)
})
