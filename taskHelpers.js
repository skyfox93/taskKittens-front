function findTask(id,lists){
  let task={}
  lists.forEach((list)=>{
    let temptask=list.tasks.find((task)=> task.id == id)
    if (temptask){task=temptask}
  })
  return task
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
    //if(calView){dateString='change due date'}
      // check for title, asign the title
    const title= task.title ? task.title : 'enter text here'
    // calendar view shows the list title as well as the task
    const listTitle= calView ? `<span class="task-listname">${task.listTitle}<span>` : ''
    //  task has a conditional class
    const taskClass= task.complete ? (showComplete ? 'complete-show' : 'complete' ) : 'task'
    return taskHTML +
      // html for  individual task
      // li innerHTML should match renderTask
    `<li data-id="${task.id}" id="${calView ? 'task-cal'+task.id :'task'+task.id}" class="${taskClass}">
      <input type="checkbox" data-action="complete" data-id="${task.id}" ${task.complete ? 'checked' : ''} data-list_id="${task.list_id}">
      <img src="${task.priority ? './icons/staricon.png' :'./icons/unstar.png'}" class="icon" data-action="star" data-id="${task.id}">
      <span class="task_title" data-action="edit-task-title" data-id="${task.id}" contenteditable="true">${title}</span>
      ${listTitle}
      <span class="date" data-action="set_date" data-list="list${task.list_id}" data-id="${task.id}">${dateString}</span>
      <button class="remove" data-action="remove-task" data-id="${task.id}" data-list_id='${task.list_id}'>X</button>


    </li>`
  }
}
function renderTask(el,task,lists,calView=false){
  const list_id = task.list_id
  const  foundList=findList(list_id,lists);
  const showComplete=foundList.showCompleted
  // if the user set a due date, add it to the html, otherwise, add placeholder text
  // if the user set a due date, add it to the html, otherwise, add placeholder text
  let dateString=''
    // if it has a due date, convert it to a date, check if its overdue, and mark it it as overdue
  if(task.due_date){
    const date=new Date(task.due_date)
    dateString= date.toDateString().slice(0,10)
  }
  else{dateString='no due date'}
  if(calView){dateString='change due date'}

    // check for title, asign the title
  const title= task.title ? task.title : 'enter text here'
  // calendar view shows the list title as well as the task
  const listTitle= calView ? `<span>${task.listTitle}<span>` : ''
  //  task has a conditional class
  el.className=task.complete ? (showComplete ? 'complete-show' : 'complete' ) : 'task'
  el.dataset.id=task.id
  el.id=calView ? 'task-cal'+task.id :'task'+task.id
  el.innerHTML=`<input type="checkbox" data-action="complete" data-id="${task.id}" ${task.complete ? 'checked' : ''} data-list_id="${task.list_id}">
    <img src="${task.priority ? 'icons/staricon.png' :'./icons/unstar.png'}" class="icon" data-action="star" data-id="${task.id}">
    <span class="task_title" data-action="edit-task-title" data-id="${task.id}" contenteditable="true">${title}</span>
    ${listTitle}
    <span class="date" data-action="set_date" data-list="list${task.list_id}" data-id="${task.id}">${dateString}</span>
    <button class="remove" data-action="remove-task" data-id="${task.id}" data-list_id='${task.list_id}'>X</button>`;
}
