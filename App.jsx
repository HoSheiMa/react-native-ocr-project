/* eslint-disable no-console */
import React from 'react';
import {StyleSheet, Text, View, TouchableOpacity, Dimensions} from 'react-native';
// eslint-disable-next-line import/no-unresolved
import {RNCamera} from 'react-native-camera';
import firestore from '@react-native-firebase/firestore';
import {
    AdMobBanner,
    AdMobInterstitial,
    PublisherBanner,
    AdMobRewarded,
} from 'react-native-admob'

const landmarkSize = 2;

export default class App extends React.Component {
  state = {
    flash: 'off',
    zoom: 0,
    autoFocus: 'on',
    depth: 0,
    type: 'back',
    whiteBalance: 'auto',
    ratio: '16:9',
    recordOptions: {
      mute: false,
      maxDuration: 5,
      quality: RNCamera.Constants.VideoQuality['288p'],
    },
    isRecording: false,
    canDetectFaces: false,
    canDetectText: true,
    canDetectBarcode: false,
    faces: [],
    textBlocks: [],
    barcodes: [],
      firebaseData: [],
      FirebaseDataMatched: [],
  };

  toggle = (value) => () =>
    this.setState((prevState) => ({[value]: !prevState[value]}));

  renderTextBlocks = () => (
    <View style={styles.facesContainer} pointerEvents="none">
      {this.state.textBlocks.map(this.renderTextBlock)}
    </View>
  );

  renderTextBlock = ({bounds, value, color}) => {
      // console.log('values :', value)

      let Found = false;
      value = value.trim().split(' ');
      // console.log(value, '  ----  ', this.state.firebaseData)
      for (let o in value) {
          let keys = Object.keys(this.state.firebaseData);
          for (let i in keys) {
              let keyValue = (this.state.firebaseData)[keys[i]];
              let key = keys[i];
              // console.log(key === value[o], keyValue, i, keys, value[o])
              if (key === value[o]) {
                  Found = true;
                  break;
              }
          }
      }

          if (!this.state.firebaseData[value] && Found === false) {
              // console.log('empty....')
         return <View/>;
      }


      console.log('found');
return    (<React.Fragment key={value + bounds.origin.x}>
      <Text
        style={[
          styles.textBlock,
          {left: bounds.origin.x, top: bounds.origin.y},
        ]}
      />
      <View
        style={[
          styles.text,
          {
            borderColor: color
          },
          {
            ...bounds.size,
            left: bounds.origin.x,
            top: bounds.origin.y,
          },
        ]}
      />
    </React.Fragment>
  )
  }

  textRecognized = (object) => {
    let {textBlocks} = object;
    for (let i in textBlocks) {
        textBlocks[i].color =
            'rgb(' +
            Math.floor(Math.random() * 256) +
            ',' +
            Math.floor(Math.random() * 256) +
            ',' +
            Math.floor(Math.random() * 256) +
            ')';
    }
    this.setState({textBlocks});
  };

  async componentDidMount() {
    var data = await firestore()
      .collection('data')
      .get();
    let FullData = {};
    data.forEach((d) => {
        FullData[d.data().name] = d.data().value;
      })

      this.setState({
          firebaseData: FullData
      });
  }

  renderCamera() {
    const {canDetectFaces, canDetectText, canDetectBarcode} = this.state;
    return (
      <RNCamera
        ref={(ref) => {
          this.camera = ref;
        }}
        style={{
          flex: 1,
        }}
        type={this.state.type}
        flashMode={this.state.flash}
        autoFocus={this.state.autoFocus}
        zoom={this.state.zoom}
        whiteBalance={this.state.whiteBalance}
        ratio={this.state.ratio}
        focusDepth={this.state.depth}
        trackingEnabled
        androidCameraPermissionOptions={{
          title: 'Permission to use camera',
          message: 'We need your permission to use your camera',
          buttonPositive: 'Ok',
          buttonNegative: 'Cancel',
        }}
        onTextRecognized={canDetectText ? this.textRecognized : null}
        onGoogleVisionBarcodesDetected={
          canDetectBarcode ? this.barcodeRecognized : null
        }
        googleVisionBarcodeType={
          RNCamera.Constants.GoogleVisionBarcodeDetection.BarcodeType.ALL
        }
        googleVisionBarcodeMode={
          RNCamera.Constants.GoogleVisionBarcodeDetection.BarcodeMode.ALTERNATE
        }>


        {!!canDetectText && this.renderTextBlocks()}
      </RNCamera>
    );
  }

    GetDataFromFirebase = () => {


// Display an interstitial
        // admob
//         AdMobInterstitial.setAdUnitID('ca-app-pub-9178044274089976~7578885155');
//         AdMobInterstitial.setTestDevices([AdMobInterstitial.simulatorId]);
//         AdMobInterstitial.requestAd().then(() => AdMobInterstitial.showAd());

        let DataMatchedWithFirebase = [];
        let UsedAlready = [];
        for (let i in this.state.textBlocks) {
            let text = this.state.textBlocks[i].value;
            let color = this.state.textBlocks[i].color;


            // if (this.state.firebaseData[text]) {
            //     DataMatchedWithFirebase.push({
            //         name: text,
            //         value: this.state.firebaseData[text],
            //         color: color
            //     })
            //     console.log('found');
            // }
            // console.log(value, '  ----  ', this.state.firebaseData)
            let value = text.trim().split(' ');
            for (let o in value) {
                let keys = Object.keys(this.state.firebaseData);
                for (let i in keys) {
                    let keyValue = (this.state.firebaseData)[keys[i]];
                    let key = keys[i];
                    // console.log(key === value[o], keyValue, i, keys, value[o])
                    if (key === value[o]) {

                        if (!UsedAlready.includes(key)) {
                            DataMatchedWithFirebase.push({
                                name: key,
                                value: keyValue,
                                color: color
                            })
                            UsedAlready.push(key)

                        }

                        }
                }
            }



        }
        if (DataMatchedWithFirebase.length > 0) {
            this.setState({
                FirebaseDataMatched: DataMatchedWithFirebase,
            })
        }
    }

  render() {
    return <View style={styles.container}>
        {/*<AdMobBanner*/}
        {/*    adSize="fullBanner"*/}
        {/*    adUnitID="ca-app-pub-3940256099942544/5224354917"*/}
        {/*    testDevices={[AdMobBanner.simulatorId]}*/}
        {/*    onAdFailedToLoad={error => console.error(error)}*/}
        {/*/>*/}
        {this.renderCamera()}

    <View style={{
        position: 'absolute',
        bottom:0,
        left: 0,
        backgroundColor:'#eee',
    }}>
        <View style={{
        padding: 15,}
        }>
            {this.state.FirebaseDataMatched.map((v, i) => {
                console.log(v)
                return <View style={{
                marginBottom: 15,
                }}>
                    <Text key={i}><Text style={{
                        color: v.color
                    }}>{v.name}</Text>: {v.value}</Text>
                </View>
            })}

        </View>
        <TouchableOpacity onPress={this.GetDataFromFirebase} style={{
            width: Dimensions.get('window').width,
            height:80,
            textAlign:'center',
            justifyContent:'center',
            backgroundColor:'#006d77'

        }
        }>
            <Text style={{

                textAlign:'center',
                justifyContent:'center',
                fontWeight:'bold',
                color:'#fff',
                fontSize: 21,
            }}>New Search</Text>
        </TouchableOpacity>
    </View></View>;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
    backgroundColor: '#000',
  },
  flipButton: {
    flex: 0.3,
    height: 40,
    marginHorizontal: 2,
    marginBottom: 10,
    marginTop: 10,
    borderRadius: 8,
    borderColor: 'white',
    borderWidth: 1,
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flipText: {
    color: 'white',
    fontSize: 15,
  },
  zoomText: {
    position: 'absolute',
    bottom: 70,
    zIndex: 2,
    left: 2,
  },
  picButton: {
    backgroundColor: 'darkseagreen',
  },
  facesContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0,
    top: 0,
  },
  face: {
    padding: 10,
    borderWidth: 2,
    borderRadius: 2,
    position: 'absolute',
    borderColor: '#FFD700',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  landmark: {
    width: landmarkSize,
    height: landmarkSize,
    position: 'absolute',
    backgroundColor: 'red',
  },
  faceText: {
    color: '#FFD700',
    fontWeight: 'bold',
    textAlign: 'center',
    margin: 10,
    backgroundColor: 'transparent',
  },
  text: {
    padding: 10,
    borderWidth: 2,
    borderRadius: 2,
    position: 'absolute',
    borderColor: '#F00',
    justifyContent: 'center',
  },
  textBlock: {
    color: '#F00',
    position: 'absolute',
    textAlign: 'center',
    backgroundColor: 'transparent',
  },
});
