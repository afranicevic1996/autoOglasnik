var express = require('express');

//admin homepage
exports.adminIndex = async function(req, res){
    if(req.method == "GET"){
        return res.send("admin panelelelel");
    }
}