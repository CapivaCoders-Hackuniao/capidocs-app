import { FormGroup, FormBuilder } from "@angular/forms";
import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-profile",
  templateUrl: "./profile.component.html",
  styleUrls: ["./profile.component.css"],
})
export class ProfileComponent implements OnInit {
  constructor() {}

  infoWallet = [
    {
      wallet: "0x777F6F894aD5a50d340FF7bE5f330290c3f3A0a2",
    },
  ];

  ngOnInit(): void {}
}
