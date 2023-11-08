#!/usr/bin/nodejs

str1 = "1111111122222222333333334444444455555555666666667777777788888888"


function toMatrix(str1) {
    a = []
    for (i=0; i<8; i++) {
        a[i] = str1.substr(8*i,8).split("").map(x => Number.parseInt(x))
    }
    console.log(a)
}

function plotMatrix(m1) {

}


toMatrix(str1)
console.log()