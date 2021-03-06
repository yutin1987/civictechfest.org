import React, { Component } from "react";
import { getLocale, getString } from "javascripts/locale";
import avatarURL from "javascripts/helpers/avatar";
import Lightbox from "javascripts/components/Lightbox";
import styles from "./styles.css";
import presenters from "./presenters.json";
import schedulesByTrack from "javascripts/components/Schedule/schedules_by_track.json";
import classnames from "classnames/bind";
import Session from "javascripts/components/Schedule/session";

const cx = classnames.bind(styles);

class SpeakerList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showSession: false,
      currentSessions: [],
    }
  }

  componentDidMount() {
    const { hash } = this.props.properties.location;
    //console.log(this.props.properties);
    let presenter_name = hash.replace('#', '').replace(/_3/g, "(").replace(/_4/g, ")").replace(/_/g, " ");
    console.log("searching for "+presenter_name);
    let presenter = presenters['en-US'].filter(presenter => presenter.name == presenter_name)[0];
    if (typeof presenter !== 'undefined') {
      const [locale] = getLocale().split('-');
      let sessions = this.getSessionIdsBySpeaker(presenter, locale);
      console.log(sessions);
      setTimeout(() => document.getElementById(hash).scrollIntoView(false), 300);
      this.setState({
        showSession: true,
        currentSessions: sessions
      });
    }
  }

  enableSession(value) {
    this.setState({
      showSession: true,
      currentSessions: value
    })
  }

  disableSession = () => {
    this.setState({
      showSession: false,
      currentSessions: []
    })
  }

  speaker_el = (speaker) => {
    const avatar = avatarURL(speaker);
    const [locale] = getLocale().split('-');
    let sessions = this.getSessionIdsBySpeaker(speaker, locale);

    return (
      <a className={styles.speakers} key={speaker.name}
        id = {speaker.name.replace(/ /g, "_").replace(/\(/g, "_3").replace(/\)/g, "_4")}// HACK to support ( and ) in names
        href= {`#${speaker.name.replace(/ /g, "_").replace(/\(/g, "_3").replace(/\)/g, "_4")}`}
        onClick={this.enableSession.bind(this, sessions)}
        data-session={cx({
                          "false": !this.state.showSession,
                          "true": this.state.showSession
        })} 
      >
        <span className={styles.inner}>
          <span className={styles.avatar}>
            <span>
              <img src={avatar} />
            </span>
          </span>
          <span className={styles.about}>
            <h3>{speaker.name}</h3>
            <p>{speaker.title}</p>
            <p>{speaker.organization}</p>
          </span>
        </span>

      </a>
    );
  }
  /*
    @Purpose: Use name in speaker.json to search the data in schedules_by_track.json
    @return: event => () =>
            time,
            id(day-all-index) or id(none-index)  if nothing found in schedules_by_track.json
  */
  getSessionIdsBySpeaker(speaker, locale) {
    let sessiondata = [];
    //let ids = [];
    let speaker_id = "";

    for ( let i=0; i<=3; i++ ) {
      Array.prototype.push.apply(sessiondata, schedulesByTrack[getLocale()]["day"+i].filter((day, index) => {
        if(day.event.speaker_f && day.event.speaker_f.includes(getString(speaker, 'name', locale))||
           (day.event.moderator_f && day.event.moderator_f.includes(getString(speaker, 'name', locale))) //||
          ) {
          //ids.push("day"+i+"-all-" + index.toString());
          return true;
        }else {
          return false;
        }
      })
      );
    }

    if(sessiondata.length >= 0) {
      return sessiondata;
    }

    // nothing found in schedules_by_track.json,so return speaker.json's data instead
    if( sessiondata.length == 0 ) {

      let speakerElement = [];
      presenters['en-US'].map((element, i) => {
          speakerElement[i] = getString(element, 'name', locale);
      });

      let session_placeholder = {
        event: () => ({
          venue: "",
          category: "",
          language: "",
          speaker:  speaker.name,
          title: speaker.title,
          bio: speaker.bio,
          abstract: "",
          avatar: speaker.avatar,
          value: speaker }),
        time: ""
      };

      return [session_placeholder];
    }
  }

  sortFunc = (a,b) => {
    const [locale] = getLocale().split('-');
    return getString(a, 'name', locale).localeCompare(getString(b, 'name', locale));
  }

  showBio = (speaker, e) => {
    e.preventDefault();
    this.refs.lightbox.setState({ show: true, speaker: speaker });
  }

  render() {
    return (
      <div className={styles.root}>
      <article className={styles.container} data-wide="true">
        <h2 className={cx({
          "header": true,
          "header-shrink" : this.state.showSession})}
        >
          Speakers
        </h2>
        <div className= {cx({"speaker-parent" : this.state.showSession })} >
          { presenters['en-US'].filter((s) => s.featured).sort(this.sortFunc).map(this.speaker_el) }
        </div>
        <div className= {cx({"speaker-parent" : this.state.showSession })} >
          { presenters['en-US'].filter((s) => !s.featured).sort(this.sortFunc).map(this.speaker_el) }
        </div>

        <div className={cx({
          "Home-session": true,
          "is-show": this.state.showSession
        }
        )}>
        { this.state.currentSessions.map((session, i) => {
          return <Session
            sessionHandler={this.disableSession}
            data={session.event}
            time={session.time}
          />
          })
        }
        </div>
      </article>
      </div>

    );
  }
};

export default SpeakerList;
