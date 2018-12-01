const { get, put, post } = require('ac/http');
const { spotify } = require('ac/webpack');

module.exports = {
  BASE_URL: 'https://api.spotify.com/v1',
  BASE_PLAYER_URL: 'https://api.spotify.com/v1/me/player',
  accessToken: null,

  async getAccessToken () {
    if (aethcord.config.spotifyToken) {
      return post('https://aethcord.aetheryx.xyz/accessToken')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send({ token: aethcord.config.spotifyToken })
        .then(res => res.body);
    }

    const {
      http,
      constants: { Endpoints }
    } = require('ac/webpack');

    const spotifyUserID = await http.get(Endpoints.CONNECTIONS)
      .then(res =>
        res.body.find(connection =>
          connection.type === 'spotify'
        ).id
      );

    return spotify.getAccessToken(spotifyUserID)
      .then(r => r.body.access_token);
  },

  genericRequest (request) {
    request.set('Authorization', `Bearer ${this.accessToken}`);

    return request
      .catch(async (err) => {
        if (err.statusCode === 401) {
          this.accessToken = await this.getAccessToken();

          delete request._res;
          return this.genericRequest(request);
        }

        console.error(err.body, request.opts);
        throw err;
      });
  },

  getPlaylists () {
    return this.genericRequest(
      get(`${this.BASE_URL}/me/playlists`)
        .query('limit', 50)
    ).then(r => r.body);
  },

  play (data) {
    return this.genericRequest(
      put(`${this.BASE_PLAYER_URL}/play`)
        .send(data)
    );
  },

  pause () {
    return this.genericRequest(put(`${this.BASE_PLAYER_URL}/pause`));
  },

  seek (position) {
    return this.genericRequest(
      put(`${this.BASE_PLAYER_URL}/seek`)
        .query('position_ms', position)
    );
  },

  next () {
    return this.genericRequest(post(`${this.BASE_PLAYER_URL}/next`));
  },

  prev () {
    return this.genericRequest(post(`${this.BASE_PLAYER_URL}/previous`));
  },

  getPlayer () {
    return this.genericRequest(get(this.BASE_PLAYER_URL))
      .then(r => r.body);
  },

  getAlbums () {
    return this.genericRequest(get(`${this.BASE_URL}/me/albums`))
      .then(r => r.body);
  },

  getDevices () {
    return this.genericRequest(get(`${this.BASE_PLAYER_URL}/devices`))
      .then(r => r.body);
  },

  setVolume (volume) {
    return this.genericRequest(
      put(`${this.BASE_PLAYER_URL}/volume`)
        .query('volume_percent', volume)
    );
  },

  setActiveDevice (deviceID) {
    return this.genericRequest(
      put(this.BASE_PLAYER_URL)
        .send({
          device_ids: [ deviceID ],
          play: true
        })
    );
  },

  setRepeatState (state) {
    return this.genericRequest(
      put(`${this.BASE_PLAYER_URL}/repeat`)
        .query('state', state)
    );
  },

  setShuffleState (state) {
    return this.genericRequest(
      put(`${this.BASE_PLAYER_URL}/shuffle`)
        .query('state', state)
    );
  }
};