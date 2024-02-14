var express = require('express');
const fs = require('fs');

exports.deleteFiles = async (fileArray) => {
  fileArray.forEach((imagePath) => {
    fs.unlink(imagePath, (err) => {
      if(err){
        console.log(err);
        return false;
      }
    });
  });

  return true;
}