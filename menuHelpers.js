
function flattenedTasks(lists){
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
function renderQuickFind(lists,quickfindC,taskContainer,showCompletedLists){
  const selected= showCompletedLists ? lists : lists.filter((list)=>list.complete==='no')
  taskContainer.classList.add('blur');

  function listReducer(listHTML,list){return listHTML +`<li class='linkItem' data-id="${list.id}" data-action='jump-to-list'> ${list.title}</li>`}

  quickfindC.innerHTML=`<ul>${selected.reduce(listReducer,'')}</ul>`
  quickfindC.style.marginTop='50px';
}

function renderCalendar(lists,taskContainer){
  taskContainer.classList.add('blur')
  document.querySelector('#calendar').style.marginTop='50px';
  //  select the tasks with a due date
  let sorted=flattenedTasks(lists).filter((task)=> !!task.due_date).filter((task)=>!task.complete)
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
    return eventsHTML + `<div class='cal-date'> ${event[0]}<ul>${reduceTasks(event[1],true)}</ul></div>`
  }
  const calHTML=events.length<1 ? '<div class="task"> All of your tasks with due dates have been completed!</div>' : events.reduce(eventsReducer,'')
  document.querySelector('#calendar').innerHTML="<div class='calBanner' data-action='close-cal'> Close </div>"+ calHTML
}
