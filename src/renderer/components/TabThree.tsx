import * as React from 'react';
import { observer, inject } from 'mobx-react';
import { StoreType } from '../store';
import { ipcRenderer } from 'electron';
import WhiteCardTabThreeWelcome from './WhiteCardTabThreeWelcome';
import WhiteCardTabThreeSelectRoot from './WhiteCardTabThreeSelectRoot';
import WhiteCardTabThreeBuildConfig from './WhiteCardTabThreeBuildConfig';

type Props = {
  store?: StoreType
}

const initialState = {
  checkedReact: false,
  checkedTypescript: false,
  checkedCSS: false,
  checkedSass: false,
  checkedLess: false,
  checkedStylus: false,
  checkedSVG: false,
  checkedPNG: false,
  rootCustomDirectory: '',
  defaultFormattedCode: '',
  AST: {},
}

type StateType = Readonly<typeof initialState>

@inject('store')
@observer

export default class TabThree extends React.Component<Props, StateType> {
  state: StateType = initialState;

  componentDidMount() {
    ipcRenderer.on('customRootDirectrySet', (event: any, customDirectory: string): void => {
      this.setState({ rootCustomDirectory: customDirectory });
    })

    ipcRenderer.send('CustomAST', 'ping')
    ipcRenderer.on('transferCustomAST', (event: any, formattedCode1: string): void => {
      console.log(formattedCode1)
      console.log('hi')
      console.log(typeof formattedCode1)
      this.setState({ defaultFormattedCode: formattedCode1 })
      //console.log(this.state.AST)
    })

    ipcRenderer.on('root-is-selected', (): void => {
      this.doSetRootSelected();
    });
  }

  handleChangeCheckboxReact = (event: any): void => {
    if (this.state.checkedReact === false) ipcRenderer.send('addReactToAST');
    else ipcRenderer.send('removeReactToAST');

    this.setState({ checkedReact: !this.state.checkedReact });
  }

  handleChangeCheckboxCSS = (event: any): void => {
    if (this.state.checkedCSS === false) ipcRenderer.send('addCSSToAST');
    else ipcRenderer.send('removeCSSToAST');

    this.setState({ checkedCSS: !this.state.checkedCSS });
  }

  handleChangeCheckboxSass = (event: any): void => {
    if (this.state.checkedSass === false) ipcRenderer.send('addSassToAST');
    else ipcRenderer.send('removeSassToAST');

    this.setState({ checkedSass: !this.state.checkedSass });
  }

  handleChangeCheckboxLess = (event: any): void => {
    if (this.state.checkedLess === false) ipcRenderer.send('addLessToAST');
    else ipcRenderer.send('removeLessToAST');

    this.setState({ checkedLess: !this.state.checkedLess });
  }

  handleChangeCheckboxStylus = (event: any): void => {
    if (this.state.checkedStylus === false) ipcRenderer.send('addStylusToAST');
    else ipcRenderer.send('removeStylusToAST');

    this.setState({ checkedStylus: !this.state.checkedStylus });
  }

  handleChangeCheckboxSVG = (event: any): void => {
    console.log('infunction first')
    if (this.state.checkedSVG === false) ipcRenderer.send('addSVGToAST');
    else ipcRenderer.send('removeSVGToAST');

    this.setState({ checkedSVG: !this.state.checkedSVG });
  }

  handleChangeCheckboxPNG = (event: any): void => {
    if (this.state.checkedPNG === false) ipcRenderer.send('addPNGToAST');
    else ipcRenderer.send('removePNGToAST');

    this.setState({ checkedPNG: !this.state.checkedPNG });
  }

  doSetRootSelected = (): void => {
    this.props.store.setRootSelected();
  }

  selectCustomWebConfigRoot = (event: any): void => {
    ipcRenderer.send('selectCustomWebConfig', 'ping');
  }

  selectGenerateWebConfigRoot = (event: any): void => {
    // console.log('hihihihihi')
    ipcRenderer.send('saveCustomConfig', this.state.rootCustomDirectory);
    //
    this.doSetCustomConfigSaved();
  }

  doSetCustomConfigSaved(): void {
    this.props.store.setCustomConfigSavedTrue()
  }

  render() {
    const codeString = '(num) => num + 1';
    const { store } = this.props;
    return (
      <div className="mainContainerHome">
        <div>

          <WhiteCardTabThreeWelcome
            isRootSelected={store.isRootSelected}
          />

          {!store.isRootSelected &&
            <WhiteCardTabThreeSelectRoot
              selectCustomWebConfigRoot={this.selectCustomWebConfigRoot}
            />
          }

          {store.isRootSelected &&

            <WhiteCardTabThreeBuildConfig
              handleChangeCheckboxReact={this.handleChangeCheckboxReact}
              handleChangeCheckboxCSS={this.handleChangeCheckboxCSS}
              handleChangeCheckboxSass={this.handleChangeCheckboxSass}
              handleChangeCheckboxLess={this.handleChangeCheckboxLess}
              handleChangeCheckboxStylus={this.handleChangeCheckboxStylus}
              handleChangeCheckboxSVG={this.handleChangeCheckboxSVG}
              handleChangeCheckboxPNG={this.handleChangeCheckboxPNG}
              isRootSelected={store.isRootSelected}
              customConfigSaved={store.customConfigSaved}
              selectGenerateWebConfigRoot={this.selectGenerateWebConfigRoot}
              defaultFormattedCode={this.state.defaultFormattedCode}
            />
          }

        </div>
      </div>
    );
  }
}