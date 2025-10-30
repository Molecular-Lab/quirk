package common

type HttpResponse struct {
	Response any `json:"response"`

	// error
	Code  string `json:"code,omitempty"`
	Error string `json:"error,omitempty"`
}
