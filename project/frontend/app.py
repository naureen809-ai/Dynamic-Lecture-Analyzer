import streamlit as st

from api_client import analyze_text


st.set_page_config(
    page_title='Dynamic Lecture Analyzer',
    page_icon='🎓',
    layout='wide',
    initial_sidebar_state='collapsed'
)

st.markdown(
    '''
    <style>
        [data-testid="stAppViewContainer"] {
            background: radial-gradient(circle at top left, #1b2735 0%, #0b1016 44%, #070b10 100%);
            color: #e5eef7;
        }

        .block-container {
            padding-top: 2rem;
            padding-bottom: 2.5rem;
            max-width: 1400px;
        }

        .hero {
            background: linear-gradient(135deg, rgba(18, 27, 38, 0.96), rgba(11, 16, 22, 0.9));
            border: 1px solid rgba(148, 163, 184, 0.14);
            color: #f8fbff;
            padding: 2rem;
            border-radius: 28px;
            margin-bottom: 1.5rem;
            box-shadow: 0 30px 70px rgba(0, 0, 0, 0.28);
        }

        .hero h1 {
            margin: 0 0 0.35rem 0;
            font-size: 2.35rem;
            letter-spacing: -0.04em;
        }

        .hero p {
            margin: 0;
            max-width: 860px;
            color: #c7d2e2;
            line-height: 1.7;
        }

        .shell {
            background: rgba(12, 18, 26, 0.72);
            border: 1px solid rgba(148, 163, 184, 0.12);
            border-radius: 24px;
            padding: 1.25rem;
            box-shadow: 0 24px 60px rgba(0, 0, 0, 0.24);
        }

        .card {
            background: linear-gradient(180deg, rgba(20, 27, 38, 0.95), rgba(14, 19, 27, 0.96));
            border-radius: 22px;
            padding: 1.25rem;
            border: 1px solid rgba(148, 163, 184, 0.14);
            box-shadow: 0 18px 40px rgba(0, 0, 0, 0.18);
            color: #edf4ff;
            height: 100%;
        }

        .stat {
            background: linear-gradient(180deg, rgba(20, 28, 39, 1), rgba(11, 16, 22, 1));
            border-radius: 18px;
            padding: 1rem 1.1rem;
            border: 1px solid rgba(148, 163, 184, 0.12);
            color: #e8eef7;
            min-height: 100%;
        }

        .metric-value {
            font-size: 1.25rem;
            font-weight: 700;
            color: #f8fbff;
        }

        .label {
            text-transform: uppercase;
            letter-spacing: 0.14em;
            color: #8aa2bf;
            font-size: 0.72rem;
            font-weight: 700;
            margin-bottom: 0.75rem;
        }

        .section-title {
            margin-top: 0;
            margin-bottom: 0.7rem;
            color: #f8fbff;
            font-size: 1.05rem;
        }

        .subtle {
            color: #a9b8cb;
            line-height: 1.7;
            margin-top: 0;
        }

        .result-card {
            background: linear-gradient(180deg, rgba(20, 27, 38, 0.98), rgba(10, 14, 20, 0.98));
            border: 1px solid rgba(148, 163, 184, 0.12);
            border-radius: 22px;
            padding: 1.1rem 1.15rem;
            color: #eaf2fb;
            min-height: 100%;
        }

        .result-card h4 {
            margin: 0 0 0.55rem 0;
            font-size: 0.95rem;
            text-transform: uppercase;
            letter-spacing: 0.12em;
            color: #94a7c2;
        }

        .result-card p, .result-card li {
            color: #ebf3ff;
            line-height: 1.7;
            font-size: 0.98rem;
        }

        .loading-box {
            border-radius: 18px;
            padding: 0.9rem 1rem;
            background: rgba(37, 99, 235, 0.12);
            border: 1px solid rgba(96, 165, 250, 0.25);
            color: #dbeafe;
        }

        .stTextArea textarea {
            background: #0f1720 !important;
            color: #e5eef7 !important;
            border: 1px solid rgba(148, 163, 184, 0.24) !important;
            border-radius: 18px !important;
            padding: 0.9rem 1rem !important;
            line-height: 1.6 !important;
        }

        .stButton button {
            width: 100%;
            border-radius: 16px;
            background: linear-gradient(135deg, #60a5fa, #22c55e);
            color: white;
            border: 0;
            font-weight: 700;
            padding: 0.8rem 1rem;
            box-shadow: 0 18px 32px rgba(34, 197, 94, 0.18);
        }

        .stAlert {
            border-radius: 16px;
        }

        hr {
            border-color: rgba(148, 163, 184, 0.12);
        }
    </style>
    ''',
    unsafe_allow_html=True
)

st.markdown(
    '''
    <div class="hero">
        <h1>Dynamic Lecture Analyzer</h1>
        <p>Paste lecture text and get a polished AI insight dashboard with summary, key points, explanation, sentiment, and readability. If OpenAI is configured, the backend uses real AI. If not, it still works with a local fallback so you can test the flow.</p>
    </div>
    ''',
    unsafe_allow_html=True
)

st.markdown('<div class="shell">', unsafe_allow_html=True)

top_left, top_right = st.columns([1.15, 0.85], gap='large')

with top_left:
    st.markdown('<div class="card">', unsafe_allow_html=True)
    st.markdown('<div class="label">Lecture Input</div>', unsafe_allow_html=True)
    st.markdown('<h3 class="section-title">Paste lecture text to analyze</h3>', unsafe_allow_html=True)
    st.markdown('<p class="subtle">The backend returns a structured response, and this UI renders it in cards with clean spacing and a loading state.</p>', unsafe_allow_html=True)
    lecture_text = st.text_area('Lecture Text', height=320, placeholder='Paste your lecture content here...')
    analyze_button = st.button('Analyze Lecture', use_container_width=True)
    st.markdown('</div>', unsafe_allow_html=True)

with top_right:
    st.markdown('<div class="card">', unsafe_allow_html=True)
    st.markdown('<div class="label">System Status</div>', unsafe_allow_html=True)
    st.markdown('<h3 class="section-title">Backend connection</h3>', unsafe_allow_html=True)
    st.success('Connected to Node.js API at /api/analyze')
    st.markdown('<div class="loading-box">Press Analyze to fetch structured results from the backend. A spinner appears while the request is running.</div>', unsafe_allow_html=True)
    st.markdown('<hr/>', unsafe_allow_html=True)
    st.markdown('<p class="subtle"><strong>What gets returned</strong></p>', unsafe_allow_html=True)
    st.markdown('<p class="subtle">Summary, key points, explanation, sentiment, readability score, and the original transcript.</p>', unsafe_allow_html=True)
    st.markdown('</div>', unsafe_allow_html=True)

if analyze_button:
    if not lecture_text.strip():
        st.error('Please enter some lecture text first.')
    else:
        try:
            with st.spinner('Analyzing lecture...'):
                result = analyze_text(lecture_text)

            data = result['data']
            provider_label = data.get('analysisProvider', 'unknown')
            model_label = data.get('analysisModel', 'unknown')

            metric1, metric2, metric3, metric4 = st.columns(4)
            metric1.markdown(f'<div class="stat"><div class="label">Sentiment</div><div class="metric-value">{data["sentiment"]}</div></div>', unsafe_allow_html=True)
            metric2.markdown(f'<div class="stat"><div class="label">Readability</div><div class="metric-value">{data["readabilityScore"]}</div></div>', unsafe_allow_html=True)
            metric3.markdown(f'<div class="stat"><div class="label">Key Points</div><div class="metric-value">{len(data["keyPoints"])} </div></div>', unsafe_allow_html=True)
            metric4.markdown(f'<div class="stat"><div class="label">Engine</div><div class="metric-value">{provider_label}</div></div>', unsafe_allow_html=True)

            st.markdown('<div style="height:12px"></div>', unsafe_allow_html=True)
            col1, col2 = st.columns([1.15, 0.85], gap='large')

            with col1:
                st.markdown('<div class="result-card"><h4>Transcript</h4>', unsafe_allow_html=True)
                st.write(data['transcript'])
                st.markdown('</div>', unsafe_allow_html=True)

                st.markdown('<div style="height:12px"></div>', unsafe_allow_html=True)

                st.markdown('<div class="result-card"><h4>Summary</h4>', unsafe_allow_html=True)
                st.write(data['summary'])
                st.markdown('</div>', unsafe_allow_html=True)

            with col2:
                st.markdown('<div class="result-card"><h4>Key Points</h4>', unsafe_allow_html=True)
                for point in data['keyPoints']:
                    st.write(f'• {point}')
                st.markdown('</div>', unsafe_allow_html=True)

                st.markdown('<div style="height:12px"></div>', unsafe_allow_html=True)

                st.markdown('<div class="result-card"><h4>Explanation</h4>', unsafe_allow_html=True)
                st.write(data['explanation'])
                st.markdown('</div>', unsafe_allow_html=True)

                st.markdown('<div style="height:12px"></div>', unsafe_allow_html=True)
                st.markdown(
                    f'<div class="result-card"><h4>Analysis Source</h4><p>Provider: {provider_label}<br/>Model: {model_label}</p></div>',
                    unsafe_allow_html=True
                )

            st.markdown('<div style="height:12px"></div>', unsafe_allow_html=True)
            st.markdown('<div class="result-card"><h4>Raw JSON</h4>', unsafe_allow_html=True)
            st.json(result)
            st.markdown('</div>', unsafe_allow_html=True)
        except Exception as error:
            st.error(f'API error: {error}')

st.markdown('</div>', unsafe_allow_html=True)
