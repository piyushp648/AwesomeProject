/** @format */

import React from 'react';
import {
  Image,
  PixelRatio,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ImagePicker from 'react-native-image-picker';
import RNTesseractOcr from 'react-native-tesseract-ocr';
import Tts from 'react-native-tts';

// Tts.voices().then(voices => console.log(voices));
// Tts.engines().then(engines => console.log(engines));
// Tts.requestInstallData();
export default class App extends React.Component {
  state = {
    avatarSource: null,
    ocrResult: null
  };


  constructor(props) {
    super(props);

    this.selectPhotoTapped = this.selectPhotoTapped.bind(this);
    // this.selectVideoTapped = this.selectVideoTapped.bind(this);
    this.recognize = this.recognize.bind(this);
    this.readText = this.readText.bind(this);
    this.initTts = this.initTts.bind(this);
    Tts.getInitStatus().then(this.initTts());
  }

  initTts = async () => {
    const voices = await Tts.voices();
    console.log(voices)
    const availableVoices = voices
      .filter(v => !v.networkConnectionRequired && !v.notInstalled)
      .map(v => {
        return { id: v.id, name: v.name, language: v.language };
      });

    console.log(availableVoices)
    const indianVoices = availableVoices
      .filter(v => v.language == "en-IN")
      .map(v => {
        return { id: v.id, name: v.name, language: v.language };
      });

    console.log(indianVoices)
    let selectedVoice = null;
    if (indianVoices && indianVoices.length > 0) {
      selectedVoice = indianVoices[0].id;
      try {
        await Tts.setDefaultLanguage(indianVoices[0].language);

      } catch (err) {
        console.log(`set default language error`, err);
      }
      await Tts.setDefaultVoice(indianVoices[0].id)
      this.setState({
        voices: indianVoices,
        selectedVoice,
        ttsStatus: 'initialized',
      });
      console.log("Following voice is selected")
      console.log(selectedVoice)

    }
    else if (availableVoices && availableVoices.length > 0) {
      selectedVoice = availableVoices[0].id;
      try {
        await Tts.setDefaultLanguage(availableVoices[0].language);
      } catch (err) {
        //Samsung S9 has always this error: "Language is not supported"
        console.log(`setDefaultLanguage error `, err);
      }
      await Tts.setDefaultVoice(availableVoices[0].id);
      this.setState({
        voices: availableVoices,
        selectedVoice,
        ttsStatus: 'initialized',
      });
    } else {
      this.setState({ ttsStatus: 'failed' });
      console.log("no offline voice available.")
    }
  };
  readText = async () => {
    await Tts.stop();
    Tts.speak(this.state.ocrResult, {
      androidParams: {
        KEY_PARAM_PAN: -1,
        KEY_PARAM_VOLUME: 0.5,
        KEY_PARAM_STREAM: 'STREAM_MUSIC',
      }
    })
    console.log("inside readtext")
  }

  selectPhotoTapped() {
    const options = {
      quality: 1.0,
      // maxWidth: 500,
      // maxHeight: 500,
      storageOptions: {
        skipBackup: true,
      },
      mediaType: 'photo'
    };



    ImagePicker.showImagePicker(options, response => {
      // console.log('Response = ', response);

      if (response.didCancel) {
        console.log('User cancelled photo picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      } else {
        let source = {
          uri: response.uri,
          origURL: response.origURL,
          path: response.path
        };

        // You can also display the image using data:
        // let source = { uri: 'data:image/jpeg;base64,' + response.data };

        this.setState({
          avatarSource: source,
        });
      }
    });
  }

  recognize() {

    if (this.state.avatarSource === null) {
      console.log("image not selected.");
      return
    } else {
      console.log(this.state.avatarSource.path);
      const tessOptions = {
        whitelist: 'qwertyuiopasdfghjklzxcvbnm1234567890',
        blacklist: '\'!"#$%&()={}[]+*_:;<>@\.\\'
        // blacklist:null
      };


      const imgPath = this.state.avatarSource.path
      // const imgPath = '/storage/emulated/0/Download/menu_cropped.png'


      RNTesseractOcr.recognize(imgPath, 'LANG_ENGLISH', tessOptions)
        .then((result) => {
          this.setState({ ocrResult: result });
          console.log("OCR Result: ", result);
          this.readText()


          // .then(voices => console.log(voices));
        })
        .catch((err) => {
          console.log("OCR Error: ", err);
        })
        .done();
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={this.selectPhotoTapped.bind(this)}>
          <View
            style={[styles.avatar, styles.avatarContainer, { marginBottom: 20 }]}>
            {this.state.avatarSource === null ? (
              <Text>Select a Photo</Text>
            ) : (
                <Image style={styles.avatar} source={this.state.avatarSource} />
              )}
          </View>
        </TouchableOpacity>

        {/* <TouchableOpacity onPress={this.selectVideoTapped.bind(this)}>
          <View style={[styles.avatar, styles.avatarContainer, {marginBottom: 20}]}>
            <Text>Select a Video</Text>
          </View>
        </TouchableOpacity> */}

        <TouchableOpacity onPress={this.recognize.bind(this)}>
          <View
            style={[styles.avatar, styles.avatarContainer, { marginBottom: 20 }]}>
            <Text>OCR</Text>
          </View>
        </TouchableOpacity>

        {/* {this.state.videoSource && (
          <Text style={{margin: 8, textAlign: 'center'}}>
            {this.state.videoSource}
          </Text>
        )} */}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  avatarContainer: {
    borderColor: '#9B9B9B',
    borderWidth: 1 / PixelRatio.get(),
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    borderRadius: 75,
    width: 150,
    height: 150,
  },
});