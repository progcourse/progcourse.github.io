
let tableColumns = document.getElementsByTagName('td');

function getNumber(){
    let number = document.getElementById('number');

    tableColumns[0].innerText = number.value;
}

function getBgColor(){
    let bgColor = document.getElementById('background');

    tableColumns[1].innerText = bgColor.value;
}


function getTextColor(){
    let textColor = document.getElementById('color');

    tableColumns[2].innerText = textColor.value;
}

function getText(){
    let text = document.getElementById('text');

    tableColumns[3].innerText = text.value;


}

function change(){
    let number = tableColumns[0].innerText;
    let bgColor = tableColumns[1].innerText;
    let color = tableColumns[2].innerText;
    let text = tableColumns[3].innerText;

    let div = document.getElementById('div'+number);

    div.style.backgroundColor = bgColor;
    div.style.color = color;
    div.innerText = text;
}