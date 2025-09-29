--
-- PostgreSQL database dump
--

-- Dumped from database version 17.2 (Ubuntu 17.2-1.pgdg24.04+1)
-- Dumped by pg_dump version 17.2 (Ubuntu 17.2-1.pgdg24.04+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: cache; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cache (
    key character varying(255) NOT NULL,
    value text NOT NULL,
    expiration integer NOT NULL
);


ALTER TABLE public.cache OWNER TO postgres;

--
-- Name: cache_locks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cache_locks (
    key character varying(255) NOT NULL,
    owner character varying(255) NOT NULL,
    expiration integer NOT NULL
);


ALTER TABLE public.cache_locks OWNER TO postgres;

--
-- Name: domain_analysis; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.domain_analysis (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    company_name character varying(255) NOT NULL,
    company_website character varying(255) NOT NULL,
    analysis_data json,
    summary text,
    industry character varying(255),
    keywords json,
    competitors json,
    website_info json,
    status character varying(255) DEFAULT 'pending'::character varying NOT NULL,
    error_message text,
    processed_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT domain_analysis_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'processing'::character varying, 'completed'::character varying, 'failed'::character varying])::text[])))
);


ALTER TABLE public.domain_analysis OWNER TO postgres;

--
-- Name: domain_analysis_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.domain_analysis_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.domain_analysis_id_seq OWNER TO postgres;

--
-- Name: domain_analysis_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.domain_analysis_id_seq OWNED BY public.domain_analysis.id;


--
-- Name: failed_jobs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.failed_jobs (
    id bigint NOT NULL,
    uuid character varying(255) NOT NULL,
    connection text NOT NULL,
    queue text NOT NULL,
    payload text NOT NULL,
    exception text NOT NULL,
    failed_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.failed_jobs OWNER TO postgres;

--
-- Name: failed_jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.failed_jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.failed_jobs_id_seq OWNER TO postgres;

--
-- Name: failed_jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.failed_jobs_id_seq OWNED BY public.failed_jobs.id;


--
-- Name: job_batches; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.job_batches (
    id character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    total_jobs integer NOT NULL,
    pending_jobs integer NOT NULL,
    failed_jobs integer NOT NULL,
    failed_job_ids text NOT NULL,
    options text,
    cancelled_at integer,
    created_at integer NOT NULL,
    finished_at integer
);


ALTER TABLE public.job_batches OWNER TO postgres;

--
-- Name: jobs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.jobs (
    id bigint NOT NULL,
    queue character varying(255) NOT NULL,
    payload text NOT NULL,
    attempts smallint NOT NULL,
    reserved_at integer,
    available_at integer NOT NULL,
    created_at integer NOT NULL
);


ALTER TABLE public.jobs OWNER TO postgres;

--
-- Name: jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.jobs_id_seq OWNER TO postgres;

--
-- Name: jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.jobs_id_seq OWNED BY public.jobs.id;


--
-- Name: migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    migration character varying(255) NOT NULL,
    batch integer NOT NULL
);


ALTER TABLE public.migrations OWNER TO postgres;

--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.migrations_id_seq OWNER TO postgres;

--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: monitor_ai_models; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.monitor_ai_models (
    id bigint NOT NULL,
    monitor_id bigint NOT NULL,
    ai_model_id character varying(255) NOT NULL,
    ai_model_name character varying(255) NOT NULL,
    ai_model_icon character varying(255) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.monitor_ai_models OWNER TO postgres;

--
-- Name: monitor_ai_models_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.monitor_ai_models_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.monitor_ai_models_id_seq OWNER TO postgres;

--
-- Name: monitor_ai_models_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.monitor_ai_models_id_seq OWNED BY public.monitor_ai_models.id;


--
-- Name: monitor_chart_data; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.monitor_chart_data (
    id bigint NOT NULL,
    monitor_id bigint NOT NULL,
    chart_type character varying(255) NOT NULL,
    date date NOT NULL,
    value numeric(8,2) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT monitor_chart_data_chart_type_check CHECK (((chart_type)::text = ANY ((ARRAY['visibility'::character varying, 'mentions'::character varying, 'citation_rank'::character varying])::text[])))
);


ALTER TABLE public.monitor_chart_data OWNER TO postgres;

--
-- Name: monitor_chart_data_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.monitor_chart_data_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.monitor_chart_data_id_seq OWNER TO postgres;

--
-- Name: monitor_chart_data_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.monitor_chart_data_id_seq OWNED BY public.monitor_chart_data.id;


--
-- Name: monitor_citations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.monitor_citations (
    id bigint NOT NULL,
    monitor_id bigint NOT NULL,
    domain character varying(255) NOT NULL,
    count integer NOT NULL,
    percentage numeric(5,2) NOT NULL,
    favicon_url character varying(255),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.monitor_citations OWNER TO postgres;

--
-- Name: monitor_citations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.monitor_citations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.monitor_citations_id_seq OWNER TO postgres;

--
-- Name: monitor_citations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.monitor_citations_id_seq OWNED BY public.monitor_citations.id;


--
-- Name: monitor_stats; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.monitor_stats (
    id bigint NOT NULL,
    monitor_id bigint NOT NULL,
    date date NOT NULL,
    visibility_score numeric(5,2) DEFAULT '0'::numeric NOT NULL,
    total_prompts integer DEFAULT 0 NOT NULL,
    total_responses integer DEFAULT 0 NOT NULL,
    mentions integer DEFAULT 0 NOT NULL,
    avg_citation_rank numeric(4,1) DEFAULT '0'::numeric NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.monitor_stats OWNER TO postgres;

--
-- Name: monitor_stats_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.monitor_stats_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.monitor_stats_id_seq OWNER TO postgres;

--
-- Name: monitor_stats_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.monitor_stats_id_seq OWNED BY public.monitor_stats.id;


--
-- Name: monitors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.monitors (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    name character varying(255) NOT NULL,
    website_name character varying(255) NOT NULL,
    website_url character varying(255) NOT NULL,
    status character varying(255) DEFAULT 'active'::character varying NOT NULL,
    description text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    setup_status character varying(255) DEFAULT 'pending'::character varying NOT NULL,
    setup_error text,
    analysis_data json,
    company_summary text,
    industry character varying(255),
    keywords json,
    competitors json,
    analyzed_at timestamp(0) without time zone,
    prompts_generated integer DEFAULT 0 NOT NULL,
    prompts_generated_at timestamp(0) without time zone,
    CONSTRAINT monitors_setup_status_check CHECK (((setup_status)::text = ANY ((ARRAY['pending'::character varying, 'analyzing'::character varying, 'generating_prompts'::character varying, 'completed'::character varying, 'failed'::character varying])::text[]))),
    CONSTRAINT monitors_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'inactive'::character varying])::text[])))
);


ALTER TABLE public.monitors OWNER TO postgres;

--
-- Name: monitors_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.monitors_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.monitors_id_seq OWNER TO postgres;

--
-- Name: monitors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.monitors_id_seq OWNED BY public.monitors.id;


--
-- Name: onboarding_progress; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.onboarding_progress (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    current_step integer DEFAULT 1 NOT NULL,
    completed_at timestamp(0) without time zone,
    company_name character varying(255),
    company_website character varying(255),
    first_name character varying(255),
    last_name character varying(255),
    job_role character varying(255),
    company_size character varying(255),
    language character varying(255),
    country character varying(255),
    referral_source character varying(255),
    company_description text,
    industry character varying(255),
    website_analysis json,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    monitor_id bigint
);


ALTER TABLE public.onboarding_progress OWNER TO postgres;

--
-- Name: onboarding_progress_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.onboarding_progress_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.onboarding_progress_id_seq OWNER TO postgres;

--
-- Name: onboarding_progress_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.onboarding_progress_id_seq OWNED BY public.onboarding_progress.id;


--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.password_reset_tokens (
    email character varying(255) NOT NULL,
    token character varying(255) NOT NULL,
    created_at timestamp(0) without time zone
);


ALTER TABLE public.password_reset_tokens OWNER TO postgres;

--
-- Name: prompt_generation_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.prompt_generation_requests (
    id uuid NOT NULL,
    user_id bigint NOT NULL,
    monitor_id uuid,
    domain_analysis_id uuid,
    company_name character varying(255) NOT NULL,
    company_website character varying(255) NOT NULL,
    industry character varying(255),
    keywords json,
    competitors json,
    summary text,
    status character varying(255) DEFAULT 'pending'::character varying NOT NULL,
    prompts_generated integer DEFAULT 0 NOT NULL,
    error_message text,
    processed_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    ai_model character varying(100),
    CONSTRAINT prompt_generation_requests_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'processing'::character varying, 'completed'::character varying, 'failed'::character varying])::text[])))
);


ALTER TABLE public.prompt_generation_requests OWNER TO postgres;

--
-- Name: prompts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.prompts (
    id uuid NOT NULL,
    monitor_id bigint NOT NULL,
    text text NOT NULL,
    type character varying(255) DEFAULT 'brand-specific'::character varying NOT NULL,
    intent character varying(255) DEFAULT 'informational'::character varying NOT NULL,
    language_code character varying(5) DEFAULT 'en'::character varying NOT NULL,
    language_name character varying(50) DEFAULT 'English'::character varying NOT NULL,
    language_flag character varying(10) DEFAULT '🇺🇸'::character varying NOT NULL,
    generated_by_ai boolean DEFAULT true NOT NULL,
    prompt_generation_request_id uuid,
    response_count integer DEFAULT 0 NOT NULL,
    visibility_percentage numeric(5,2) DEFAULT '0'::numeric NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT prompts_intent_check CHECK (((intent)::text = ANY ((ARRAY['informational'::character varying, 'commercial'::character varying])::text[]))),
    CONSTRAINT prompts_type_check CHECK (((type)::text = ANY ((ARRAY['brand-specific'::character varying, 'organic'::character varying, 'competitor'::character varying])::text[])))
);


ALTER TABLE public.prompts OWNER TO postgres;

--
-- Name: responses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.responses (
    id uuid NOT NULL,
    prompt_id uuid NOT NULL,
    monitor_id bigint NOT NULL,
    model_name character varying(100) NOT NULL,
    response_text text NOT NULL,
    brand_mentioned boolean DEFAULT false NOT NULL,
    sentiment character varying(255),
    visibility_score numeric(5,2) DEFAULT '0'::numeric NOT NULL,
    competitors_mentioned json,
    citation_sources json,
    tokens_used integer,
    cost numeric(10,4) DEFAULT '0'::numeric NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT responses_sentiment_check CHECK (((sentiment)::text = ANY ((ARRAY['positive'::character varying, 'neutral'::character varying, 'negative'::character varying, 'mixed'::character varying])::text[])))
);


ALTER TABLE public.responses OWNER TO postgres;

--
-- Name: sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sessions (
    id character varying(255) NOT NULL,
    user_id bigint,
    ip_address character varying(45),
    user_agent text,
    payload text NOT NULL,
    last_activity integer NOT NULL
);


ALTER TABLE public.sessions OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    email_verified_at timestamp(0) without time zone,
    password character varying(255) NOT NULL,
    remember_token character varying(100),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    google_id character varying(255),
    avatar character varying(255),
    waitlist_joined_at timestamp(0) without time zone
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: domain_analysis id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.domain_analysis ALTER COLUMN id SET DEFAULT nextval('public.domain_analysis_id_seq'::regclass);


--
-- Name: failed_jobs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.failed_jobs ALTER COLUMN id SET DEFAULT nextval('public.failed_jobs_id_seq'::regclass);


--
-- Name: jobs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs ALTER COLUMN id SET DEFAULT nextval('public.jobs_id_seq'::regclass);


--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Name: monitor_ai_models id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.monitor_ai_models ALTER COLUMN id SET DEFAULT nextval('public.monitor_ai_models_id_seq'::regclass);


--
-- Name: monitor_chart_data id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.monitor_chart_data ALTER COLUMN id SET DEFAULT nextval('public.monitor_chart_data_id_seq'::regclass);


--
-- Name: monitor_citations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.monitor_citations ALTER COLUMN id SET DEFAULT nextval('public.monitor_citations_id_seq'::regclass);


--
-- Name: monitor_stats id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.monitor_stats ALTER COLUMN id SET DEFAULT nextval('public.monitor_stats_id_seq'::regclass);


--
-- Name: monitors id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.monitors ALTER COLUMN id SET DEFAULT nextval('public.monitors_id_seq'::regclass);


--
-- Name: onboarding_progress id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.onboarding_progress ALTER COLUMN id SET DEFAULT nextval('public.onboarding_progress_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: cache; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cache (key, value, expiration) FROM stdin;
\.


--
-- Data for Name: cache_locks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cache_locks (key, owner, expiration) FROM stdin;
\.


--
-- Data for Name: domain_analysis; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.domain_analysis (id, user_id, company_name, company_website, analysis_data, summary, industry, keywords, competitors, website_info, status, error_message, processed_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: failed_jobs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.failed_jobs (id, uuid, connection, queue, payload, exception, failed_at) FROM stdin;
\.


--
-- Data for Name: job_batches; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.job_batches (id, name, total_jobs, pending_jobs, failed_jobs, failed_job_ids, options, cancelled_at, created_at, finished_at) FROM stdin;
\.


--
-- Data for Name: jobs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.jobs (id, queue, payload, attempts, reserved_at, available_at, created_at) FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.migrations (id, migration, batch) FROM stdin;
1	0001_01_01_000000_create_users_table	1
2	0001_01_01_000001_create_cache_table	1
3	0001_01_01_000002_create_jobs_table	1
4	2025_06_24_000045_create_onboarding_progress_table	2
5	2025_06_30_065712_add_google_oauth_and_waitlist_fields_to_users_table	3
6	2025_07_02_000000_create_domain_analysis_table	3
7	2025_07_04_034206_create_monitors_table	3
8	2025_07_04_034231_create_monitor_ai_models_table	3
9	2025_07_04_034259_create_monitor_stats_table	3
10	2025_07_04_034323_create_monitor_chart_data_table	3
11	2025_07_04_034341_create_monitor_citations_table	3
12	2025_07_04_180227_create_prompt_generation_requests_table	3
13	2025_07_04_180250_create_prompts_table	3
14	2025_07_05_163201_fix_prompts_monitor_id_data_type	3
15	2025_07_05_170334_optimize_monitors_table_structure	3
16	2025_07_06_032554_add_monitor_id_to_onboarding_progress	3
17	2025_07_06_061951_create_responses_table	3
19	2025_07_06_111634_add_ai_model_to_prompt_generation_requests_table	4
20	2025_08_06_030628_add_performance_indexes	4
\.


--
-- Data for Name: monitor_ai_models; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.monitor_ai_models (id, monitor_id, ai_model_id, ai_model_name, ai_model_icon, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: monitor_chart_data; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.monitor_chart_data (id, monitor_id, chart_type, date, value, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: monitor_citations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.monitor_citations (id, monitor_id, domain, count, percentage, favicon_url, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: monitor_stats; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.monitor_stats (id, monitor_id, date, visibility_score, total_prompts, total_responses, mentions, avg_citation_rank, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: monitors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.monitors (id, user_id, name, website_name, website_url, status, description, created_at, updated_at, setup_status, setup_error, analysis_data, company_summary, industry, keywords, competitors, analyzed_at, prompts_generated, prompts_generated_at) FROM stdin;
\.


--
-- Data for Name: onboarding_progress; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.onboarding_progress (id, user_id, current_step, completed_at, company_name, company_website, first_name, last_name, job_role, company_size, language, country, referral_source, company_description, industry, website_analysis, created_at, updated_at, monitor_id) FROM stdin;
1	1	3	2025-06-24 02:41:30	test	https://facebook.com	test	test	test	2-10	en-GB	DE	google	Log in to Facebook to start sharing and connecting with your friends, family and people you know.	HR Management Software	{"title":"Facebook \\u2013 log in or sign up","description":"Log in to Facebook to start sharing and connecting with your friends, family and people you know.","industry":"HR Management Software"}	2025-06-24 02:40:21	2025-06-24 02:41:30	\N
2	2	3	2025-06-24 03:03:32	test	https://facebook.com	asdasd	asd	asdasdasd	2-10	es-ES	US	\N	Log in to Facebook to start sharing and connecting with your friends, family and people you know.	HR Management Software	{"title":"Facebook \\u2013 log in or sign up","description":"Log in to Facebook to start sharing and connecting with your friends, family and people you know.","industry":"HR Management Software"}	2025-06-24 03:02:43	2025-06-24 03:03:32	\N
\.


--
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.password_reset_tokens (email, token, created_at) FROM stdin;
\.


--
-- Data for Name: prompt_generation_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.prompt_generation_requests (id, user_id, monitor_id, domain_analysis_id, company_name, company_website, industry, keywords, competitors, summary, status, prompts_generated, error_message, processed_at, created_at, updated_at, ai_model) FROM stdin;
\.


--
-- Data for Name: prompts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.prompts (id, monitor_id, text, type, intent, language_code, language_name, language_flag, generated_by_ai, prompt_generation_request_id, response_count, visibility_percentage, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: responses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.responses (id, prompt_id, monitor_id, model_name, response_text, brand_mentioned, sentiment, visibility_score, competitors_mentioned, citation_sources, tokens_used, cost, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sessions (id, user_id, ip_address, user_agent, payload, last_activity) FROM stdin;
sW0FahE9QwKoJ2FYu2UpKosFOYXPHIltN2rqFGei	\N	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	YTozOntzOjY6Il90b2tlbiI7czo0MDoiaFVIdWNiRmh5dTFHREtFNnJxN044d3lSdEpYbnY3Z2dFQzdES2hGVSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6NzA6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMS8ud2VsbC1rbm93bi9hcHBzcGVjaWZpYy9jb20uY2hyb21lLmRldnRvb2xzLmpzb24iO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19	1750924317
6efTeQWQ8XZPZ5q2goWAIpEgyQ6ErVcYSA8udL6O	1	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	YTo0OntzOjY6Il90b2tlbiI7czo0MDoiM29WY29Pdk9DMnZNWkl2WlJGNmJyZnpUR05ERzlMMjVZYXkzWHQzQiI7czo1MDoibG9naW5fd2ViXzU5YmEzNmFkZGMyYjJmOTQwMTU4MGYwMTRjN2Y1OGVhNGUzMDk4OWQiO2k6MTtzOjk6Il9wcmV2aW91cyI7YToxOntzOjM6InVybCI7czozMToiaHR0cDovL2xvY2FsaG9zdDo4MDAxL2Rhc2hib2FyZCI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=	1750931684
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, email_verified_at, password, remember_token, created_at, updated_at, google_id, avatar, waitlist_joined_at) FROM stdin;
2	test	contact@bistank.com	\N	$2y$12$rHx.7RVYuuZaKUxUJ1nm1u5knRhrf8H09A/hObTTHWLMubQRsI9Oi	\N	2025-06-24 01:36:01	2025-06-24 01:36:01	\N	\N	\N
1	john	test@bistank.com	\N	$2y$12$0I8u.TUwZTMKbs6lNGXpoudZoo5S0veXoSUaeKLGMgam1Ab8Xy5KG	G3Q5utqczcC6N5x75yxLsl05Aj0WQEk4AE24vbqnhyRwQxtdAfKbJgCbb6ck	2025-06-24 01:10:31	2025-06-24 01:10:31	\N	\N	\N
\.


--
-- Name: domain_analysis_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.domain_analysis_id_seq', 1, false);


--
-- Name: failed_jobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.failed_jobs_id_seq', 1, false);


--
-- Name: jobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.jobs_id_seq', 1, false);


--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.migrations_id_seq', 20, true);


--
-- Name: monitor_ai_models_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.monitor_ai_models_id_seq', 1, false);


--
-- Name: monitor_chart_data_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.monitor_chart_data_id_seq', 1, false);


--
-- Name: monitor_citations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.monitor_citations_id_seq', 1, false);


--
-- Name: monitor_stats_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.monitor_stats_id_seq', 1, false);


--
-- Name: monitors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.monitors_id_seq', 1, false);


--
-- Name: onboarding_progress_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.onboarding_progress_id_seq', 2, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 2, true);


--
-- Name: cache_locks cache_locks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cache_locks
    ADD CONSTRAINT cache_locks_pkey PRIMARY KEY (key);


--
-- Name: cache cache_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cache
    ADD CONSTRAINT cache_pkey PRIMARY KEY (key);


--
-- Name: domain_analysis domain_analysis_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.domain_analysis
    ADD CONSTRAINT domain_analysis_pkey PRIMARY KEY (id);


--
-- Name: failed_jobs failed_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_pkey PRIMARY KEY (id);


--
-- Name: failed_jobs failed_jobs_uuid_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_uuid_unique UNIQUE (uuid);


--
-- Name: job_batches job_batches_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_batches
    ADD CONSTRAINT job_batches_pkey PRIMARY KEY (id);


--
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: monitor_ai_models monitor_ai_models_monitor_id_ai_model_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.monitor_ai_models
    ADD CONSTRAINT monitor_ai_models_monitor_id_ai_model_id_unique UNIQUE (monitor_id, ai_model_id);


--
-- Name: monitor_ai_models monitor_ai_models_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.monitor_ai_models
    ADD CONSTRAINT monitor_ai_models_pkey PRIMARY KEY (id);


--
-- Name: monitor_chart_data monitor_chart_data_monitor_id_chart_type_date_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.monitor_chart_data
    ADD CONSTRAINT monitor_chart_data_monitor_id_chart_type_date_unique UNIQUE (monitor_id, chart_type, date);


--
-- Name: monitor_chart_data monitor_chart_data_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.monitor_chart_data
    ADD CONSTRAINT monitor_chart_data_pkey PRIMARY KEY (id);


--
-- Name: monitor_citations monitor_citations_monitor_id_domain_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.monitor_citations
    ADD CONSTRAINT monitor_citations_monitor_id_domain_unique UNIQUE (monitor_id, domain);


--
-- Name: monitor_citations monitor_citations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.monitor_citations
    ADD CONSTRAINT monitor_citations_pkey PRIMARY KEY (id);


--
-- Name: monitor_stats monitor_stats_monitor_id_date_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.monitor_stats
    ADD CONSTRAINT monitor_stats_monitor_id_date_unique UNIQUE (monitor_id, date);


--
-- Name: monitor_stats monitor_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.monitor_stats
    ADD CONSTRAINT monitor_stats_pkey PRIMARY KEY (id);


--
-- Name: monitors monitors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.monitors
    ADD CONSTRAINT monitors_pkey PRIMARY KEY (id);


--
-- Name: onboarding_progress onboarding_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.onboarding_progress
    ADD CONSTRAINT onboarding_progress_pkey PRIMARY KEY (id);


--
-- Name: onboarding_progress onboarding_progress_user_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.onboarding_progress
    ADD CONSTRAINT onboarding_progress_user_id_unique UNIQUE (user_id);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (email);


--
-- Name: prompt_generation_requests prompt_generation_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prompt_generation_requests
    ADD CONSTRAINT prompt_generation_requests_pkey PRIMARY KEY (id);


--
-- Name: prompts prompts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prompts
    ADD CONSTRAINT prompts_pkey PRIMARY KEY (id);


--
-- Name: responses responses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.responses
    ADD CONSTRAINT responses_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: domain_analysis_created_at_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX domain_analysis_created_at_index ON public.domain_analysis USING btree (created_at);


--
-- Name: domain_analysis_user_id_status_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX domain_analysis_user_id_status_index ON public.domain_analysis USING btree (user_id, status);


--
-- Name: jobs_queue_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX jobs_queue_index ON public.jobs USING btree (queue);


--
-- Name: monitor_ai_models_monitor_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX monitor_ai_models_monitor_id_index ON public.monitor_ai_models USING btree (monitor_id);


--
-- Name: monitor_chart_data_monitor_id_chart_type_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX monitor_chart_data_monitor_id_chart_type_index ON public.monitor_chart_data USING btree (monitor_id, chart_type);


--
-- Name: monitor_citations_created_at_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX monitor_citations_created_at_index ON public.monitor_citations USING btree (created_at);


--
-- Name: monitor_citations_monitor_id_count_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX monitor_citations_monitor_id_count_index ON public.monitor_citations USING btree (monitor_id, count);


--
-- Name: monitor_citations_monitor_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX monitor_citations_monitor_id_index ON public.monitor_citations USING btree (monitor_id);


--
-- Name: monitor_stats_monitor_id_date_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX monitor_stats_monitor_id_date_index ON public.monitor_stats USING btree (monitor_id, date);


--
-- Name: monitors_created_at_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX monitors_created_at_index ON public.monitors USING btree (created_at);


--
-- Name: monitors_setup_status_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX monitors_setup_status_index ON public.monitors USING btree (setup_status);


--
-- Name: monitors_user_id_setup_status_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX monitors_user_id_setup_status_index ON public.monitors USING btree (user_id, setup_status);


--
-- Name: monitors_user_id_status_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX monitors_user_id_status_index ON public.monitors USING btree (user_id, status);


--
-- Name: onboarding_progress_monitor_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX onboarding_progress_monitor_id_index ON public.onboarding_progress USING btree (monitor_id);


--
-- Name: onboarding_progress_user_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX onboarding_progress_user_id_index ON public.onboarding_progress USING btree (user_id);


--
-- Name: prompt_generation_requests_created_at_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX prompt_generation_requests_created_at_index ON public.prompt_generation_requests USING btree (created_at);


--
-- Name: prompt_generation_requests_status_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX prompt_generation_requests_status_index ON public.prompt_generation_requests USING btree (status);


--
-- Name: prompt_generation_requests_user_id_status_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX prompt_generation_requests_user_id_status_index ON public.prompt_generation_requests USING btree (user_id, status);


--
-- Name: prompts_created_at_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX prompts_created_at_index ON public.prompts USING btree (created_at);


--
-- Name: prompts_monitor_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX prompts_monitor_id_index ON public.prompts USING btree (monitor_id);


--
-- Name: prompts_monitor_id_is_active_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX prompts_monitor_id_is_active_index ON public.prompts USING btree (monitor_id, is_active);


--
-- Name: prompts_monitor_id_type_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX prompts_monitor_id_type_index ON public.prompts USING btree (monitor_id, type);


--
-- Name: prompts_prompt_generation_request_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX prompts_prompt_generation_request_id_index ON public.prompts USING btree (prompt_generation_request_id);


--
-- Name: responses_created_at_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX responses_created_at_index ON public.responses USING btree (created_at);


--
-- Name: responses_model_name_created_at_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX responses_model_name_created_at_index ON public.responses USING btree (model_name, created_at);


--
-- Name: responses_monitor_id_brand_mentioned_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX responses_monitor_id_brand_mentioned_index ON public.responses USING btree (monitor_id, brand_mentioned);


--
-- Name: responses_prompt_id_created_at_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX responses_prompt_id_created_at_index ON public.responses USING btree (prompt_id, created_at);


--
-- Name: sessions_last_activity_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX sessions_last_activity_index ON public.sessions USING btree (last_activity);


--
-- Name: sessions_user_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX sessions_user_id_index ON public.sessions USING btree (user_id);


--
-- Name: domain_analysis domain_analysis_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.domain_analysis
    ADD CONSTRAINT domain_analysis_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: monitor_ai_models monitor_ai_models_monitor_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.monitor_ai_models
    ADD CONSTRAINT monitor_ai_models_monitor_id_foreign FOREIGN KEY (monitor_id) REFERENCES public.monitors(id) ON DELETE CASCADE;


--
-- Name: monitor_chart_data monitor_chart_data_monitor_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.monitor_chart_data
    ADD CONSTRAINT monitor_chart_data_monitor_id_foreign FOREIGN KEY (monitor_id) REFERENCES public.monitors(id) ON DELETE CASCADE;


--
-- Name: monitor_citations monitor_citations_monitor_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.monitor_citations
    ADD CONSTRAINT monitor_citations_monitor_id_foreign FOREIGN KEY (monitor_id) REFERENCES public.monitors(id) ON DELETE CASCADE;


--
-- Name: monitor_stats monitor_stats_monitor_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.monitor_stats
    ADD CONSTRAINT monitor_stats_monitor_id_foreign FOREIGN KEY (monitor_id) REFERENCES public.monitors(id) ON DELETE CASCADE;


--
-- Name: monitors monitors_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.monitors
    ADD CONSTRAINT monitors_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: onboarding_progress onboarding_progress_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.onboarding_progress
    ADD CONSTRAINT onboarding_progress_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: prompt_generation_requests prompt_generation_requests_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prompt_generation_requests
    ADD CONSTRAINT prompt_generation_requests_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: prompts prompts_monitor_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prompts
    ADD CONSTRAINT prompts_monitor_id_foreign FOREIGN KEY (monitor_id) REFERENCES public.monitors(id) ON DELETE CASCADE;


--
-- Name: prompts prompts_prompt_generation_request_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prompts
    ADD CONSTRAINT prompts_prompt_generation_request_id_foreign FOREIGN KEY (prompt_generation_request_id) REFERENCES public.prompt_generation_requests(id) ON DELETE SET NULL;


--
-- Name: responses responses_monitor_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.responses
    ADD CONSTRAINT responses_monitor_id_foreign FOREIGN KEY (monitor_id) REFERENCES public.monitors(id) ON DELETE CASCADE;


--
-- Name: responses responses_prompt_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.responses
    ADD CONSTRAINT responses_prompt_id_foreign FOREIGN KEY (prompt_id) REFERENCES public.prompts(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

