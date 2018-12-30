
document.addEventListener('DOMContentLoaded', function(){
// establish datepicker instance. It submits a patch request when clicked.
const picker=datepicker('#date-input',{ alwaysShow: true, onSelect: (instance, date) => {
pickerEl.style.display="none";
const id= dateInput.dataset.id
let showCompleted=false
let userId=''
const taskEl= document.querySelector(`#task${id}`)
adapter.patchTask(id,{task:{due_date: dateInput.value}}).then((task)=>renderTask(taskEl,task))}
})

// define Dom elemements
  const pickerEl=document.querySelector('.qs-datepicker')
  pickerEl.style.display="none"
  const dateInput=document.querySelector('#date-input')
  const container=document.getElementById('main')

  const adapter=Adapter('http://localhost:3000/api/v1')
  let lists=[] // reassigned after first fetch

  // get all list and tasks for this user
  fetch('http://localhost:3000/api/v1/users/2/lists').
  then((resp)=> resp.json())
  .then(data=> {
  userId=data[0].user.id
    lists=data
    data.forEach((list)=>addTaskList(list))
  })

  // adds new listCard to DOM
  function addTaskList(list){
    const listCard= document.createElement('div')
    listCard.className="listCard"
    listCard.id=`list${list.id}`
    updateListCard(listCard,list)
    container.prepend(listCard)
    if(list.tasks.length>=1){determineFlip(list)}

  }


    // updates list card innerHTML
  function updateListCard(listCard, list){
    const listHTML= list.tasks ? reduceTasks(list) :''
    listCard.innerHTML= `
    <div class='listCard-inner'>
      <div class="listCard-front" data-type='listFace'>
        <div class="listCard-header"><h2 data-type='list-header' data-list_id="${list.id}" contenteditable="true">${list.title}</h2><span class='show-complete'></div>
        <ul data-list_id="${list.id}"> ${listHTML} </ul> <input type="text" placeholder="enter a task" id="input${list.id}"><button class="add-task" data-action='add-task' data-list_id="${list.id}"> Add Task </button>
      </div>
      <div class='listCard-back' data-type='kittenFace'>
      <h2>${list.title}</h2>
      <div><h3>List Complete!</h3><input type="text" placeholder="enter a task" id="input-back${list.id}"> <button class="add-task" data-action='add-task-back' data-list_id="${list.id}"> Add Task </button></div>
      </div>
    </div>`
  }

  function reduceTasks(list){
  return list.tasks.reduce((function(taskHTML,task){
    // if the user set a due date, add it to the html, otherwise, add placeholder text
      const DateString=''
      if(task.due_date){
      const date=new Date(task.due_date)
       dateString= date.toDateString().slice(0,10)}
      else{dateString='set due date'}
      const title= task.title ? task.title : 'enter text here'
      return taskHTML +
      // html for  individual task
      // li innerHTML should match renderTask
        `<li data-id="${task.id}" id="task${task.id}" class="${task.complete ? 'task complete' : 'task'}">
            <input type="checkbox" data-action="complete" data-id="${task.id}" ${task.complete ? 'checked' : ''} data-list_id="${list.id}">
            <img src="${task.priority ? 'staricon.png' :'./unstar.png'}" class="icon" data-action="star" data-id="${task.id}">
            <span class="task_title" data-action="expand" data-id="${task.id}">${title}</span>
            <span class="date" data-action="set_date" data-list="list${list.id}" data-id="${task.id}">${dateString}</span>
            <button class="remove" data-action="remove-task" data-id="${task.id}" data-list_id='${task.list_id}'>X</button>


            </li>`
    }),'')
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
  function determineFlip(list){
    const list_id=list.id
    const listCard=document.getElementById(`list${list_id}`)
    if(checkComplete(list)){
      list.complete= true

      listCard.className='listCard-complete'

      // if its complete, show the kitten on the front
      /*listCard.querySelector('div[data-type="listFace"]').style.transform='rotateY(180deg)'
      listCard.querySelector('div[data-type="kittenFace"]').style.transform='rotateY(0deg)'*/
    }
    else{
      // if its not complete, move kitten to the back where it can't be seen
      list.complete= false
      listCard.className='listCard'
      /*listCard.querySelector('div[data-type="listFace"]').style.transform='rotateY(0deg)'
      listCard.querySelector('div[data-type="kittenFace"]').style.transform='rotateY(180deg)'*/

    }
  }

  function renderTask(el,task){
    const DateString=''
    if(task.due_date){
    const date=new Date(task.due_date)
     dateString= date.toDateString().slice(0,10)}
    else{dateString='set due date'}
    const title= task.title ? task.title : 'enter text here'

    el.innerHTML= `
    <input type="checkbox" data-action="complete" data-id="${task.id}" ${task.complete ? 'checked' : ''} data-list_id="${task.list_id}">
    <img src="${task.priority ? 'staricon.png' :'./unstar.png'}" class="icon" data-action="star" data-id="${task.id}">
    <span class="task_title" data-action="expand" data-id="${task.id}">${title}</span>
    <span class="date" data-action="set_date" data-list="list${task.list_id}" data-id="${task.id}">${dateString}</span>
    <button class="remove" data-action="remove-task" data-id="${task.id}" data-list_id='${task.list_id}'>X</button>
        `
  }

  function handleClick(event){
    // if the user marked a task as complete, toggle completeness and send patch request
    if (event.target.dataset.action==="complete"){
      const taskId= event.target.dataset.id
      let foundTask=findTask(taskId)
      if(foundTask.complete){
        foundTask.complete=false;
        event.target.checked=false      }
      else {foundTask.complete=true;event.target.checked=true}
      // select the parent task and change its opacity
      document.getElementById(`task${taskId}`).classList.toggle('complete');

      // show the kitten if the list is complete
      const list_id = event.target.dataset.list_id
      const  foundList =findList(list_id);
      determineFlip(foundList)
      adapter.patchTask(taskId,{task:{complete: foundTask.complete}}).then(console.log)
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
        event.target.src='./staricon.png'}
        adapter.patchTask(id,{task:{priority: foundTask.priority}})
        .then((task)=> {console.log(task);renderTask(event.target.parentElement,task)})
      }

      // if the user clicked a due date, send the task id to the dateInput
      if(event.target.dataset.action==='set_date'){
        // show the event picker
        pickerEl.style.display="initial"
        pickerEl.style.top=event.pageY-100+'px'
        pickerEl.style.left=event.pageX-100+'px'
        dateInput.dataset.id=event.target.dataset.id
      }
      // if the user is adding a task
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

      // if user is removing a task
      if(event.target.dataset.action==='remove-task'){
         const id=event.target.dataset.id
         const list_id=event.target.dataset.list_id

         const choice= confirm('Really delete this task?')
         if (choice){
          const foundList=findList(list_id)
          const index=foundList.tasks.findIndex((task)=> task.id==id)
          foundList.tasks.splice(index,1)
          event.target.parentElement.remove()
          adapter.deleteTask(id).then(console.log)
          }

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
        addTaskList(list)
      })
    }
  }
  function handleKeyDown(event){
    if (event.target.dataset.type==='list-header' && event.key=='Enter'){
      const list_id= event.target.dataset.list_id
      const listCard=document.querySelector(`#list${list_id}`)
      const title=event.target.textContent
      debugger
      adapter.patchList(list_id,{list:{user_id:userId,title: title}})
      .then((list)=> {console.log(list);updateListCard(listCard,list)})
    }
  }
  container.addEventListener('click', handleClick)
  document.addEventListener('submit', handleSubmit)
  document.addEventListener('keydown',handleKeyDown)
})
