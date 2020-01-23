import {MapsAPILoader} from '@agm/core';
import {Component, ElementRef, Inject, NgZone, OnInit, Optional, ViewChild} from '@angular/core';
import {FormControl} from '@angular/forms';
import {MAT_DIALOG_DATA} from '@angular/material'; // added dialog data receive
import {MyGeoPoint} from '../../models/firestore/firestoreTypes';

// import * as maps from 'googlemaps';

@Component({
  selector: 'app-maps',
  templateUrl: './maps.component.html',
  styleUrls: ['./maps.component.scss']
})
export class MapsComponent implements OnInit {

  public latitude: number;
  public longitude: number;
  public searchControl: FormControl;
  public zoom: number;
  public draggable: boolean;

  @ViewChild('search', {static: true})
  public searchElementRef: ElementRef;
  points: marker[] = [
    {
      location: new MyGeoPoint(-1.305308, 36.872919),
      label: 'Oilcom'
    },
    {
      location: new MyGeoPoint(-4.058972, 39.671766),
      label: 'Oilcom'
    }
  ];
  clickedlocation: marker = {
    location: null,
    label: ''
  };
  // initial center position for the map
  lat = -1.287666;
  lng = 36.821434;

  // google maps zoom level
  // zoom: number = 7;

  constructor(private mapsAPILoader: MapsAPILoader,
              private ngZone: NgZone, @Optional() @Inject(MAT_DIALOG_DATA) private data?: object) {
    // if (data && data.points) {

    // }

  }

  ngOnInit() {
    this.zoom = 10;
    this.latitude = -1.28333;
    this.longitude = 36.81667;

    // create search FormControl
    this.searchControl = new FormControl();

    // set current position
    this.setCurrentPosition();

    // load Places Autocomplete
    this.mapsAPILoader.load().then(() => {
      // let autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement, {
      //   componentRestrictions: { country: 'ke' },
      // });
      // autocomplete.addListener("place_changed", () => {
      //   this.ngZone.run(() => {
      //     //get the place result
      //     let place: google.maps.places.PlaceResult = autocomplete.getPlace();

      //     //verify result
      //     if (place.geometry === undefined || place.geometry === null) {
      //       return;
      //     }

      //     //set latitude, longitude and zoom
      //     this.latitude = place.geometry.location.lat();
      //     this.longitude = place.geometry.location.lng();
      //     this.zoom = 12;
      //   });
      // });
    });
    // this.zoom = 12;
    // this.latitude = -1.28333;
    // this.longitude = 36.81667;
    // this.draggable = true;

    // //create search FormControl
    // this.searchControl = new FormControl();
    // //load Places Autocomplete
    // this.mapsAPILoader.load().then(() => {

    //   let autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement, {
    //     componentRestrictions: { country: 'ke' },
    //     types: ["address"]
    //   });

    //   let originalplace: google.maps.places.PlaceResult = autocomplete.getPlace()
    //   console.log('Loaded')

    //   autocomplete.addListener("place_changed", () => {
    //     console.log('something')
    //     this.ngZone.run(() => {
    //       //get the place result
    //       let place: google.maps.places.PlaceResult = autocomplete.getPlace();

    //       console.log(place);

    //       //verify result
    //       if (place.geometry === undefined || place.geometry === null) {
    //         return;
    //       }

    //       //set latitude, longitude and zoom
    //       this.latitude = place.geometry.location.lat();
    //       this.longitude = place.geometry.location.lng();

    //       // this.latlongChange.emit({
    //       //   'lat': this.latitude,
    //       //   'long': this.longitude
    //       // });

    //       this.zoom = 16;
    //     });
    //   });
    // });
  }

  clickedMarker(label: string, index: number) {
    // console.log(`clicked the marker: ${label || index}`)
  }

  mapClicked(event) {
    // console.log(event)
    this.clickedlocation.location = new MyGeoPoint(event.coords.lat, event.coords.lng);
    // console.log(this.clickedlocation)

    // Reset the array first
    // this.depotmarkers = []
    // this.depotmarkers.
  }

  markerDragEnd(m: marker, $event: MouseEvent) {
    // console.log('dragEnd', m, $event);
  }

  private setCurrentPosition() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
        this.zoom = 12;
      });
    }
  }
}

// just an interface for exampledata safety.
interface marker {
  location: MyGeoPoint;
  label: string;
}
