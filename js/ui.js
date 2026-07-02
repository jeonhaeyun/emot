export function showScreen(id){
  document.querySelectorAll(".screen")
    .forEach(s=>s.classList.remove("active"));

  document.getElementById(id)
    .classList.add("active");
}

export function showStimulus(stimulus){
  const textBox = document.getElementById("stimulusText");
  const img = document.getElementById("stimulusImage");

  textBox.style.display = "none";
  img.style.display = "none";

  if(stimulus.type === "text"){
    textBox.textContent = stimulus.content;
    textBox.style.display = "block";
  }else{
    img.src = stimulus.content;
    img.style.display = "block";
  }
}

export function updateCategory(left, right){
  document.getElementById("leftCategory").textContent = left;
  document.getElementById("rightCategory").textContent = right;
}


export function showFixation(){
  document.getElementById("fixation").style.display = "block";
  document.getElementById("stimulusText").style.display = "none";
  document.getElementById("stimulusImage").style.display = "none";
}



export function clearMessage(){
  document.getElementById("message").textContent = "";
}


