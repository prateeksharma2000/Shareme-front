const dropZone = document.querySelector(".drop-zone");
const fileInput = document.querySelector("#fileInput");
const browseBtn = document.querySelector(".browseBtn");
const bgProgress = document.querySelector(".bg-progress");
const percentDiv = document.querySelector("#percent");
const progressBar = document.querySelector(".progress-bar");
const progressContainer = document.querySelector(".progress-container");
const fileURL = document.querySelector("#fileURL");
const sharingContainer = document.querySelector(".sharing-container");
const copyBtn = document.querySelector("#copyBtn");
const emailForm = document.querySelector("#email-form");
const toast = document.querySelector(".toast");
const maxAllowedSize = 100 * 1024 * 1024;


const host = "https://shareme12.herokuapp.com/";
const uploadURL = `${host}api/files`;
const emailURL = `${host}api/files/send`;


dropZone.addEventListener("dragover" , (e)=>{
    e.preventDefault();
    if(!dropZone.classList.contains("dragged")){
        dropZone.classList.add("dragged");
    }
})

dropZone.addEventListener("dragleave" , ()=>{
    dropZone.classList.remove("dragged");
})

dropZone.addEventListener("drop",(e)=>{
    e.preventDefault();
    dropZone.classList.remove("dragged");
    const files = e.dataTransfer.files;

    if(files.length){
        fileInput.files = files;
        uploadFile();
    }
})

fileInput.addEventListener("change" , ()=>{
    uploadFile();
})

browseBtn.addEventListener("click",(e)=>{
    fileInput.click();
})

const uploadFile = ()=>{

    if(fileInput.files.length > 1){
        resetFileInput();
        showToast("Only upload 1 file");
        return;
    }

    progressContainer.style.display = "block";

    const files = fileInput.files[0];

    if(files.size > maxAllowedSize){
        showToast("Can't upload more than 100MB");
        resetFileInput();
        return;
    }

    const formData = new FormData();
    formData.append("myFile",files);

    const xhr = new XMLHttpRequest();
    

    xhr.onreadystatechange = ()=>{
        if (xhr.readyState == XMLHttpRequest.DONE) {
            onUploadSuccess(JSON.parse(xhr.response));
        }
    };

    xhr.upload.onprogress = updateProgress;
    
    xhr.upload.onerror = ()=>{
        resetFileInput();
        showToast(`Error in upload : ${xhr.statusText}`);
    }

    xhr.open("POST" , uploadURL);
    xhr.send(formData);

}

const updateProgress = (e)=>{
    const percent = Math.round((e.loaded / e.total) * 100);
    // console.log(e);
    bgProgress.style.width = `${percent}%`;
    percentDiv.innerText = percent;
    progressBar.style.transform = `scaleX(${percent/100})`;

}

const onUploadSuccess = ({file:url})=>{
     console.log(url);

     resetFileInput();
     emailForm[2].removeAttribute("disabled");
     progressContainer.style.display = "none";
     sharingContainer.style.display = "block";
     fileURL.value = url;
}


copyBtn.addEventListener("click" , ()=>{
    fileURL.select();
    document.execCommand("copy");
    showToast("Link Copied");
})

const resetFileInput = ()=>{
    fileInput.value = "";
}

emailForm.addEventListener("submit" , (e)=>{
    e.preventDefault();
    
    const url = fileURL.value;
    const formData = {
        uuid: url.split("/").splice(-1,1)[0],
        emailTo: emailForm.elements["to-email"].value,
        emailFrom: emailForm.elements["from-email"].value
    }
    
    emailForm[2].setAttribute("disabled" , "true");

    fetch(emailURL,{
        method: "POST",
        headers:{
            "Content-type": "application/json"
        },
        body: JSON.stringify(formData)
    })
    .then(res => res.json())
    .then(({success})=>{
        if(success){
            sharingContainer.style.display = "none";
            showToast("Email Sent");
        }
    })
})


const showToast = (msg)=>{
    toast.innerText = msg;
    toast.style.transform = "translate(-50%,0)";
    clearTimeout(toastTimer);
    var toastTimer = setTimeout(()=>{
        toast.style.transform = "translate(-50%,60px)";
    },2000);
}