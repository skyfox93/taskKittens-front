function Adapter(baseURL){
   function createTask(data){
    return fetch(baseURL+"/tasks", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Accepts': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then((resp)=> resp.json())

  }
  function patchTask(task_id,data){
    return fetch(baseURL+"/tasks/"+task_id,{
      method: "PATCH",
      headers: {
        'Content-Type': 'application/json',
        'Accepts': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then((resp)=> resp.json())

  }
  function deleteTask(taskId){
    return fetch(baseURL+"/tasks/"+taskId, {
      method: "DELETE"
    }).then((resp)=>resp.json())
  }
  function createList(userId,data){
    return fetch(`${baseURL}/users/${userId}/lists`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Accepts': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then((resp)=> resp.json())

  }


  function patchList(list_id,data){
    return fetch(`${baseURL}/lists/${list_id}`, {
      method: "PATCH",
      headers: {
        'Content-Type': 'application/json',
        'Accepts': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then((resp)=> resp.json())

  }
  function get(userId){
    return fetch(`${baseURL}/users/${userId/lists}`)
    .then((resp)=> resp.json())
  }
  return {
    get: get,
    createTask: createTask,
    createList: createList,
    patchTask: patchTask,
    deleteTask: deleteTask,
    patchList: patchList

  }
}
