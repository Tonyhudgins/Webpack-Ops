import * as React from 'react';
import Button from './Button';
import { FaCheck } from "react-icons/fa";

interface WhiteCardStatsJSONProps {
  statsFileGenerated: boolean;
  getWebpackStats(): void;
  generateStatsFile(): void;
}

const WhiteCardStatsJSON: React.SFC<WhiteCardStatsJSONProps> = (props) => {
  return (
    <div className="whiteCard">
      <div id="stats-file-selector">
        <div className="tabOne-Heading2">Load Webpack Stats</div>
        {!props.statsFileGenerated &&
          <div>
            <div className='configMessageText'>If <span className="codeText">stats.json</span> file has already been generated, click <span className="codeText">Load Stats File</span> button to load <span className="codeText">stats.json</span> file below.</div>
            <br></br>
            <div className='configMessageText'>
              If<span className="codeText">stats.json</span> file has not yet been generated, click <span className="codeText">Generate Stats File</span> button to generate <span className="codeText">stats.json</span> file</div>
          </div>
        }

        {props.statsFileGenerated &&
          <div className="homeRowFlexContainer">
            < FaCheck className="greenCheck" />
            <div className="statsGeneratedText">
              stats file generated - click 'Load Stats File' button to load <span className="codeTextStats">stats.json</span> file below.
                  </div>
          </div>
        }

        <Button
          classes="btn stats"
          func={props.getWebpackStats}
          textContent="Load Stats File"
        />

        {!props.statsFileGenerated &&
          <Button
            classes="btn stats"
            idName="genButton"
            func={props.generateStatsFile}
            textContent="Generate Stats File"
          />
        }
      </div>
    </div>
  );
}

export default WhiteCardStatsJSON;