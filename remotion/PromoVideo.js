import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const colors = {
  ink: '#0b1220',
  soft: '#43506a',
};

const title = {
  fontFamily: 'SF Pro Display, Inter, system-ui, sans-serif',
  letterSpacing: '-0.035em',
  color: colors.ink,
};

const body = {
  fontFamily: 'SF Pro Text, Inter, system-ui, sans-serif',
  color: colors.soft,
  lineHeight: 1.35,
};

const captions = [
  {from: 18, to: 110, text: 'Baby Steps is your modern piano companion.'},
  {from: 110, to: 220, text: 'Choose a key. Build chords. Hear progressions instantly.'},
  {from: 220, to: 300, text: 'Watch the keyboard show exactly what to play.'},
  {from: 300, to: 410, text: 'Practice arpeggios and scales with focused tempo control.'},
  {from: 410, to: 610, text: 'Ask the coach for voicings, emotional color, and a practical twelve minute plan.'},
  {from: 610, to: 730, text: 'From concept to fingers on keys, faster.'},
  {from: 730, to: 885, text: 'Compose. Practice. Coach. Baby Steps.'},
];

const BeatBed = () => {
  const clips = [];

  for (let f = 0; f < 900; f += 15) {
    clips.push(
      <Sequence key={`kick-${f}`} from={f} durationInFrames={6}>
        <Audio src={staticFile('salamander/A0.mp3')} volume={0.08} startFrom={0} endAt={6} />
      </Sequence>
    );
  }

  for (let f = 7; f < 900; f += 15) {
    clips.push(
      <Sequence key={`hat-${f}`} from={f} durationInFrames={4}>
        <Audio src={staticFile('salamander/Fs7.mp3')} volume={0.025} startFrom={0} endAt={3} />
      </Sequence>
    );
  }

  for (let f = 0; f < 900; f += 60) {
    clips.push(
      <Sequence key={`pad-c-${f}`} from={f} durationInFrames={30}>
        <Audio src={staticFile('salamander/C3.mp3')} volume={0.06} startFrom={0} endAt={20} />
      </Sequence>
    );
    clips.push(
      <Sequence key={`pad-fs-${f}`} from={f + 15} durationInFrames={30}>
        <Audio src={staticFile('salamander/Fs3.mp3')} volume={0.05} startFrom={0} endAt={18} />
      </Sequence>
    );
  }

  for (let f = 120; f < 900; f += 120) {
    clips.push(
      <Sequence key={`accent-${f}`} from={f} durationInFrames={16}>
        <Audio src={staticFile('salamander/A5.mp3')} volume={0.045} startFrom={0} endAt={10} />
      </Sequence>
    );
  }

  return <>{clips}</>;
};

const CaptionBar = ({frame}) => {
  const cap = captions.find((c) => frame >= c.from && frame <= c.to);
  if (!cap) return null;

  const fadeIn = interpolate(frame, [cap.from, cap.from + 10], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const fadeOut = interpolate(frame, [cap.to - 10, cap.to], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const opacity = Math.min(fadeIn, fadeOut);

  return (
    <div
      style={{
        position: 'absolute',
        left: 120,
        right: 120,
        bottom: 50,
        borderRadius: 16,
        padding: '16px 22px',
        background: 'rgba(8,15,28,0.78)',
        border: '1px solid rgba(255,255,255,0.16)',
        color: '#f8fbff',
        fontFamily: 'SF Pro Text, Inter, system-ui, sans-serif',
        fontSize: 34,
        lineHeight: 1.2,
        textAlign: 'center',
        opacity,
      }}
    >
      {cap.text}
    </div>
  );
};

const Shot = ({src, frame, from, headline, subline, bullets, accentX = 0}) => {
  const local = Math.max(0, frame - from);
  const reveal = spring({frame: local, fps: 30, config: {damping: 20, stiffness: 140}});

  const cardY = interpolate(reveal, [0, 1], [24, 0]);
  const cardOpacity = interpolate(reveal, [0, 1], [0, 1]);
  const scale = interpolate(local, [0, 140], [1.015, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const cursorX = interpolate(local, [20, 70, 130], [840 + accentX, 1080 + accentX, 965 + accentX], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const cursorY = interpolate(local, [20, 70, 130], [620, 500, 430], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
      <div
        style={{
          width: 1650,
          borderRadius: 30,
          border: '1px solid rgba(11,18,32,0.12)',
          background: 'rgba(255,255,255,0.9)',
          boxShadow: '0 48px 90px -56px rgba(10,20,40,0.7)',
          padding: 24,
          transform: `translateY(${cardY}px)`,
          opacity: cardOpacity,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 22}}>
          <div
            style={{
              borderRadius: 20,
              overflow: 'hidden',
              border: '1px solid rgba(11,18,32,0.12)',
              height: 740,
              transform: `scale(${scale})`,
            }}
          >
            <Img src={src} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          </div>

          <div style={{padding: '12px 8px'}}>
            <div style={{...title, fontWeight: 700, fontSize: 64}}>{headline}</div>
            <div style={{...body, fontSize: 31, marginTop: 14}}>{subline}</div>
            <div style={{marginTop: 26, display: 'grid', gap: 13}}>
              {bullets.map((b, i) => (
                <div
                  key={b}
                  style={{
                    ...body,
                    fontSize: 27,
                    padding: '12px 16px',
                    borderRadius: 14,
                    border: '1px solid rgba(11,18,32,0.1)',
                    background: i === 0 ? 'linear-gradient(180deg, #edf4ff, #dceaff)' : 'rgba(255,255,255,0.84)',
                  }}
                >
                  {b}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            left: cursorX,
            top: cursorY,
            width: 24,
            height: 24,
            borderRadius: 999,
            background: '#2c7bff',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: cursorX - 10,
            top: cursorY - 10,
            width: 44,
            height: 44,
            borderRadius: 999,
            border: '2px solid rgba(44,123,255,0.45)',
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

export const BabyStepsPromo = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const heroReveal = spring({frame, fps, config: {damping: 16, stiffness: 110}});
  const heroOpacity = interpolate(heroReveal, [0, 1], [0, 1]);
  const heroY = interpolate(heroReveal, [0, 1], [25, 0]);

  return (
    <AbsoluteFill
      style={{
        background:
          'radial-gradient(circle at 80% 10%, rgba(44,123,255,0.18), rgba(44,123,255,0) 38%), linear-gradient(155deg, #f8fbff 0%, #e8f1ff 50%, #fdfefe 100%)',
      }}
    >
      <BeatBed />
      <Audio src={staticFile('promo/voiceover.wav')} volume={0.95} />

      <Sequence from={0} durationInFrames={140}>
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
          <div style={{textAlign: 'center', transform: `translateY(${heroY}px)`, opacity: heroOpacity}}>
            <div style={{fontFamily: 'SF Pro Text, Inter, system-ui, sans-serif', fontSize: 32, color: '#58739e', letterSpacing: '0.14em', fontWeight: 700}}>
              BABY STEPS
            </div>
            <div style={{...title, fontSize: 120, fontWeight: 700, marginTop: 8}}>Piano Studio</div>
            <div style={{...body, fontSize: 42, marginTop: 14}}>From concept to fingers-on-keys in minutes.</div>
          </div>
        </AbsoluteFill>
      </Sequence>

      <Sequence from={120} durationInFrames={230}>
        <Shot
          src={staticFile('promo/shot-compose.png')}
          frame={frame}
          from={120}
          headline="Compose"
          subline="Pick a key, shape a progression, and audition harmony instantly."
          bullets={[
            'Select root and quality in one tap',
            'Hear progression + cadence in context',
            'Keyboard lights map chord tones',
          ]}
          accentX={0}
        />
      </Sequence>

      <Sequence from={340} durationInFrames={230}>
        <Shot
          src={staticFile('promo/shot-practice.png')}
          frame={frame}
          from={340}
          headline="Practice"
          subline="Train scales and arpeggios with controlled tempo and realistic feedback."
          bullets={[
            'Arpeggio runs across octaves',
            'Scale drills with BPM control',
            'Progress metrics update in-session',
          ]}
          accentX={-120}
        />
      </Sequence>

      <Sequence from={560} durationInFrames={180}>
        <Shot
          src={staticFile('promo/shot-coach.png')}
          frame={frame}
          from={560}
          headline="Coach"
          subline="Ask for voicings, emotional rationale, and a focused 12-minute plan."
          bullets={[
            'Context-aware practice guidance',
            'Cadence emotion explained clearly',
            'Companion-style, not course overload',
          ]}
          accentX={80}
        />
      </Sequence>

      <Sequence from={730} durationInFrames={170}>
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
          <div style={{textAlign: 'center', padding: '0 140px'}}>
            <div style={{...title, fontSize: 104, fontWeight: 700}}>Practice smarter. Sound better.</div>
            <div style={{...body, fontSize: 40, marginTop: 18}}>Baby Steps turns theory into playable results.</div>
            <div
              style={{
                marginTop: 32,
                display: 'inline-block',
                padding: '16px 34px',
                borderRadius: 14,
                background: 'linear-gradient(180deg, #3f8dff, #1d6dee)',
                color: '#f8fbff',
                fontFamily: 'SF Pro Text, Inter, system-ui, sans-serif',
                fontSize: 30,
                fontWeight: 700,
              }}
            >
              Compose • Practice • Coach
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>

      <CaptionBar frame={frame} />
    </AbsoluteFill>
  );
};
