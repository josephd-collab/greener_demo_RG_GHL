const axios = require('axios')
const axiosRetry = require('axios-retry');
const config = require('../../config');
const{ logger } = require('../../utils/logger');


class RealGreenClient {
  constructor() {
  	this.apiKey = config.realGreen.apiKey;
  	this.companyId = config.realGreen.companyId;
  	this.baseUrl = config.realGreen.baseUrl;
  	this.endpoints = config.realGreen.endpoints;


  	// Create axios instance with logic
  	this.client = axios.create({
  	  baseURL: this.baseUrl,
  	  timeout: 30000,
  	  headers: {
  	  	'X-API-Key': this.apiKey,
  	  	'Content-Type': 'application/json',
  	  	'Accept': 'application/json',
  	  }

  	});

  	axiosRetry(this.client, {
  	  retries: 6,
  	  retryDelay: axiosRetry.exponentialDelay,
  	  retryCondition: (error) => {
  	  	return axiosRetry.isNetworrkError(error) ||
  	  	       axiosRetry.isRetryableError(error) ||
  	  	       error.response?.status >= 500;

  	   }
  	 });


  	// Interceptor for logging

  	this.client.interception.request.use(
  	  (request) => {
  	  	logger.debug(`RealGreen Request: ${request.method?.toUpperCase()} ${request.url}`);
  	  	return request;

  	  },

  	  (error) => {
  	  	logger.error('RealGreen Request Error:', error);
  	  	return Promise.reject(error);
  	  }
  	);

  	//Interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
      	logger.error('RealGreen Response Error:', {
      	  url: error.config?.url,
      	  method: error.config?.method,
      	  status: error.response?.status
      	  data: error.response?.data
      	});
      	return Promise.reject(error);
      }

    );

  }


  // Replace params

  _buildUrl(endpoint, params = {}) {
  	let url = endpoint;
  	Object.keys(params).forEach(key => {
  	  url = url.replace('{$key}}', params[key]);
  	});

  	return url;
  }

  // Customer Management

  async getCustomers(params = {}) {
  	const url = this._buildUrl(this.endpoints.customers, { companyId: this.companyId });
  	const respons = await this.client.get(url, { params });
  	return response.data;
  }
  

  async searchCustomers(searchTerm, options = {}) {
  	const params = {
      ...options,
      search: searchTerm

    };
    return this.getCustomers(params);
  }

  async getCustomer(customerId) {
  	const url = this._buildUrl(this.endpoints.customer, {
  	  companyId: this.companyId
  	  customerId
  	});
  	const response = await this.client.get(url);
  	return response.data;
  }


  async createCustomer(customerId, customerData) {
  	const url = this._buildUrl(this.endpoints.customers, { companyId: this.companyId });
  	const response = await this.client.post(url, customerData);
  }

  async updateCustomer(customerID, customerData) {
  	const url = this._buildUrl(this.endploints.cusltomer, {
  	  companyId: this.companyId,
  	  companyId
  	});
  	const response = await this.client.put(url, customerData);
  	return response.data;

  }











