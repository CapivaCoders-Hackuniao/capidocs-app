import { Component, Input, OnInit } from '@angular/core';
import { PersonaCertificate } from 'src/app/models/persona.model';

@Component({
  selector: 'app-certificate',
  templateUrl: './certificate.component.html',
  styleUrls: ['./certificate.component.css']
})
export class CertificateComponent implements OnInit {
  @Input()certificate: PersonaCertificate

  constructor() { }

  ngOnInit(): void {
  }

}
